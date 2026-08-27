import { ColumnMappings } from "./schema";
import type { ColumnMappingToType } from "./schema";

import type { SearchFilters } from "~/lib/types";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
interface AnalyticsQueryResult<
    SelectionSet extends Record<string, string | number>,
> {
    meta: string;
    data: SelectionSet[];
    rows: number;
    rows_before_limit_at_least: number;
}

interface AnalyticsCountResult {
    views: number;
    visitors: number;
    bounces: number;
}

export type ViewsGroupedByInterval = [string, AnalyticsCountResult][];
/** Given an AnalyticsCountResult object, and an object representing a row returned from
 *  CF Analytics Engine w/ counts grouped by isVisitor, accumulate view,
 *  visit, and visitor counts.
 */
function accumulateCountsFromRowResult(
    counts: AnalyticsCountResult,
    row: {
        count: number;
        isVisitor: number;
        isBounce: number;
    },
) {
    if (row.isVisitor == 1) {
        counts.visitors += Number(row.count);
    }
    if (row.isBounce && row.isBounce != 0) {
        // bounce is either 1 or -1
        counts.bounces += Number(row.count) * row.isBounce;
    }
    counts.views += Number(row.count);
}

export function intervalToSql(
    interval: string,
    tz?: string,
    bucketIntervalMinutes: number = 5,
    options: { inclusiveEnd?: boolean } = {},
) {
    let startIntervalSql = "";
    let endIntervalSql = "";
    switch (interval) {
        case "today":
            // example: toDateTime('2024-01-07 00:00:00', 'America/New_York')
            startIntervalSql = `toDateTime('${dayjs().tz(tz).startOf("day").utc().format("YYYY-MM-DD HH:mm:ss")}')`;
            endIntervalSql = `toStartOfInterval(NOW(), INTERVAL '${bucketIntervalMinutes}' MINUTE)`;
            break;
        case "yesterday":
            startIntervalSql = `toDateTime('${dayjs().tz(tz).startOf("day").utc().subtract(1, "day").format("YYYY-MM-DD HH:mm:ss")}')`;
            endIntervalSql = `toDateTime('${dayjs().tz(tz).startOf("day").utc().format("YYYY-MM-DD HH:mm:ss")}')`;
            break;
        case "1d":
        case "7d":
        case "14d":
        case "30d":
        case "90d":
            startIntervalSql = `toStartOfInterval(NOW() - INTERVAL '${interval.split("d")[0]}' DAY, INTERVAL '${bucketIntervalMinutes}' MINUTE)`;
            endIntervalSql = `toStartOfInterval(NOW(), INTERVAL '${bucketIntervalMinutes}' MINUTE)`;
            break;
        default:
            startIntervalSql = `toStartOfInterval(NOW() - INTERVAL '1' DAY, INTERVAL '${bucketIntervalMinutes}' MINUTE)`;
            endIntervalSql = `toStartOfInterval(NOW(), INTERVAL '${bucketIntervalMinutes}' MINUTE)`;
    }
    if (options.inclusiveEnd && interval !== "yesterday") {
        endIntervalSql = "NOW()";
    }
    return { startIntervalSql, endIntervalSql };
}

/**
 * returns an object with keys of the form "YYYY-MM-DD HH:00:00" and values of 0
 * example:
 *   {
 *      "2021-01-01 00:00:00": 0,
 *      "2021-01-01 02:00:00": 0,
 *      "2021-01-01 04:00:00": 0,
 *      ...
 *   }
 *
 * */
function generateEmptyRowsOverInterval(
    intervalType: "DAY" | "HOUR",
    startDateTime: Date,
    endDateTime: Date,
    tz?: string,
): { [key: string]: AnalyticsCountResult } {
    if (!tz) {
        tz = "Etc/UTC";
    }

    const initialRows: { [key: string]: AnalyticsCountResult } = {};

    while (startDateTime.getTime() < endDateTime.getTime()) {
        const key = dayjs(startDateTime).utc().format("YYYY-MM-DD HH:mm:ss");
        initialRows[key] = {
            views: 0,
            visitors: 0,
            bounces: 0,
        };

        if (intervalType === "DAY") {
            // WARNING: Daylight savings hack. Cloudflare Workers uses a different Date
            //          implementation than Node 20.x, which doesn't seem to respect DST
            //          boundaries the same way(see: https://github.com/benvinegar/counterscale/issues/108).
            //
            //          To work around this, we add 25 hours to the start date/time, then get the
            //          start of the day, then convert it back to a Date object. This works in both
            //          Node 20.x and Cloudflare Workers environments.
            startDateTime = dayjs(startDateTime)
                .add(25, "hours")
                .tz(tz)
                .startOf("day")
                .toDate();
        } else if (intervalType === "HOUR") {
            startDateTime = dayjs(startDateTime).add(1, "hour").toDate();
        } else {
            throw new Error("Invalid interval type");
        }
    }

    return initialRows;
}

function filtersToSql(filters: SearchFilters) {
    const supportedFilters: Array<keyof SearchFilters> = [
        "path",
        "referrer",
        "browserName",
        "browserVersion",
        "country",
        "deviceType",
        "utmSource",
        "utmMedium",
        "utmCampaign",
        "utmTerm",
        "utmContent",
        "region",
        "city",
        "operatingSystem",
    ];

    let filterStr = "";
    supportedFilters.forEach((filter) => {
        if (Object.hasOwnProperty.call(filters, filter)) {
            filterStr += `AND ${ColumnMappings[filter]} = '${filters[filter]}'`;
        }
    });
    return filterStr;
}

function escapeSqlString(value: string): string {
    return String(value).replace(/\\/g, "\\\\").replace(/'/g, "''");
}

/**
 * NOTE: There are a bunch of "unsafe" SQL-like queries in here, in the sense that
 *       they are unparameterized raw SQL-like strings sent over HTTP. Cloudflare Analytics Engine
 *       does NOT support parameterized queries, nor is there an easy SQL-escaping
 *       library floating around for NodeJS (without using a database client library).
 *       Since Cloudflare Analytics Engine SQL API only supports SELECT, I think it's okay to
 *       leave it like this for now (i.e. an attacker cannot DROP TABLES or mutate data).
 *
 *       See: https://developers.cloudflare.com/analytics/analytics-engine/sql-reference/
 */

export class AnalyticsEngineAPI {
    cfApiToken: string;
    cfAccountId: string;
    defaultHeaders: {
        "content-type": string;
        "X-Source": string;
        Authorization: string;
    };
    defaultUrl: string;

    constructor(cfAccountId: string, cfApiToken: string) {
        this.cfAccountId = cfAccountId;
        this.cfApiToken = cfApiToken;

        this.defaultUrl = `https://api.cloudflare.com/client/v4/accounts/${this.cfAccountId}/analytics_engine/sql`;
        this.defaultHeaders = {
            "content-type": "application/json;charset=UTF-8",
            "X-Source": "Cloudflare-Workers",
            Authorization: `Bearer ${this.cfApiToken}`,
        };
    }

    async query(query: string) {
        return fetch(this.defaultUrl, {
            method: "POST",
            body: query,
            headers: this.defaultHeaders,
        });
    }

    async querySql<T extends Record<string, string | number>>(query: string): Promise<{ data: T[]; error?: string }> {
        const response = await this.query(query);
        const text = await response.text();
        let parsed: unknown;
        try {
            parsed = JSON.parse(text);
        } catch {
            return { data: [], error: text.slice(0, 400) || response.statusText };
        }

        if (!response.ok) {
            const failure = parsed as { error?: string; errors?: Array<{ message?: string }> };
            return {
                data: [],
                error: failure.error || failure.errors?.[0]?.message || response.statusText,
            };
        }

        return { data: ((parsed as AnalyticsQueryResult<T>).data || []) as T[] };
    }

    private siteClause(siteId: string): string {
        const value = escapeSqlString(siteId);
        return `(index1 = '${value}' OR ${ColumnMappings.siteId} = '${value}')`;
    }

    private async queryEventsTable<T extends Record<string, string | number>>(
        sqlFor: (table: string) => string,
    ): Promise<T[]> {
        const primary = await this.querySql<T>(sqlFor("eventsDataset"));
        if (!primary.error) {
            return primary.data;
        }

        const missingTable = /unknown table|doesn't exist|does not exist|not found/i.test(primary.error);
        if (!missingTable) {
            throw new Error(primary.error);
        }

        const fallback = await this.querySql<T>(sqlFor("metricsDataset"));
        if (fallback.error) {
            throw new Error(primary.error);
        }
        return fallback.data;
    }

    async getEvents(siteId: string, interval: string, tz?: string) {
        // Analytics Engine allows at most 10 GROUP BY columns. Group by the stored
        // blob columns (not aliases) and keep copied text, page, origin, and device.
        const { startIntervalSql, endIntervalSql } = intervalToSql(interval, tz, 5, { inclusiveEnd: true });
        type EventRow = {
            eventType: string; eventName: string; target: string; value: string; path: string;
            country: string; region: string; city: string; deviceType: string; operatingSystem: string;
            browser: string; host: string; userAgent: string; network: string; visitorId: string; sessionId: string;
            count: number; lastSeen: string; sessionDepth: number;
        };
        const sql = (table: string) => `
            SELECT blob11 as eventType, blob12 as eventName, blob13 as target, blob14 as value,
                blob3 as path, blob4 as country, blob16 as region, blob17 as city,
                blob10 as deviceType, blob18 as operatingSystem,
                argMax(blob6, timestamp) as browser,
                argMax(blob1, timestamp) as host,
                argMax(blob2, timestamp) as userAgent,
                argMax(blob15, timestamp) as network,
                argMax(blob19, timestamp) as visitorId,
                argMax(blob20, timestamp) as sessionId,
                SUM(_sample_interval) as count, MAX(timestamp) as lastSeen, MAX(double2) as sessionDepth
            FROM ${table}
            WHERE timestamp >= ${startIntervalSql} AND timestamp < ${endIntervalSql}
                AND ${this.siteClause(siteId)}
                AND blob11 IN ('screenshot', 'copy', 'scrape', 'interaction', 'outbound', 'download')
            GROUP BY blob11, blob12, blob13, blob14, blob3, blob4, blob16, blob17, blob10, blob18
            ORDER BY lastSeen DESC
            LIMIT 100`;

        return this.queryEventsTable<EventRow>(sql);
    }

    async getSessionPaths(siteId: string, interval: string, tz?: string) {
        const { startIntervalSql, endIntervalSql } = intervalToSql(interval, tz, 5, { inclusiveEnd: true });
        type Row = { sessionId: string; path: string; firstSeen: string; hits: number };
        const result = await this.querySql<Row>(`
            SELECT blob20 as sessionId, blob3 as path,
                MIN(timestamp) as firstSeen, SUM(_sample_interval) as hits
            FROM metricsDataset
            WHERE timestamp >= ${startIntervalSql} AND timestamp < ${endIntervalSql}
                AND ${this.siteClause(siteId)}
                AND blob20 != ''
            GROUP BY blob20, blob3
            ORDER BY firstSeen ASC
            LIMIT 4000`);
        if (result.error) throw new Error(result.error);
        return result.data;
    }

    async getLiveActivity(siteId: string) {
        type Row = { sessionId: string; path: string; country: string; lastSeen: string };
        const result = await this.querySql<Row>(`
            SELECT blob20 as sessionId, blob3 as path, blob4 as country, MAX(timestamp) as lastSeen
            FROM metricsDataset
            WHERE timestamp >= NOW() - INTERVAL '5' MINUTE
                AND timestamp < NOW()
                AND ${this.siteClause(siteId)}
                AND blob20 != ''
            GROUP BY blob20, blob3, blob4
            ORDER BY lastSeen DESC
            LIMIT 200`);
        if (result.error) throw new Error(result.error);
        return result.data;
    }

    async getEventValues(siteId: string, interval: string, eventType: string, tz?: string) {
        const { startIntervalSql, endIntervalSql } = intervalToSql(interval, tz, 5, { inclusiveEnd: true });
        const type = escapeSqlString(eventType);
        type Row = { value: string; path: string; count: number };
        const sql = (table: string) => `
            SELECT blob14 as value, blob3 as path, SUM(_sample_interval) as count
            FROM ${table}
            WHERE timestamp >= ${startIntervalSql} AND timestamp < ${endIntervalSql}
                AND ${this.siteClause(siteId)}
                AND blob11 = '${type}'
            GROUP BY blob14, blob3
            ORDER BY count DESC
            LIMIT 40`;
        return this.queryEventsTable<Row>(sql);
    }

    async getEventTypeCounts(siteId: string, interval: string, tz?: string) {
        const { startIntervalSql, endIntervalSql } = intervalToSql(interval, tz, 5, { inclusiveEnd: true });
        type Row = { eventType: string; count: number };
        const sql = (table: string) => `
            SELECT blob11 as eventType, SUM(_sample_interval) as count
            FROM ${table}
            WHERE timestamp >= ${startIntervalSql} AND timestamp < ${endIntervalSql}
                AND ${this.siteClause(siteId)}
                AND blob11 IN ('screenshot', 'copy', 'scrape', 'interaction', 'outbound', 'download')
            GROUP BY blob11`;
        return this.queryEventsTable<Row>(sql);
    }

    async getConvertedSessions(siteId: string, interval: string, tz?: string) {
        const { startIntervalSql, endIntervalSql } = intervalToSql(interval, tz, 5, { inclusiveEnd: true });
        type Row = { sessionId: string; count: number };
        const sql = (table: string) => `
            SELECT blob20 as sessionId, SUM(_sample_interval) as count
            FROM ${table}
            WHERE timestamp >= ${startIntervalSql} AND timestamp < ${endIntervalSql}
                AND ${this.siteClause(siteId)}
                AND blob11 IN ('copy', 'outbound', 'download')
                AND blob20 != ''
            GROUP BY blob20
            LIMIT 2000`;
        return this.queryEventsTable<Row>(sql);
    }

    async getVisitorCohorts(siteId: string) {
        type Row = { visitorId: string; firstSeen: string; lastSeen: string };
        const result = await this.querySql<Row>(`
            SELECT blob19 as visitorId, MIN(timestamp) as firstSeen, MAX(timestamp) as lastSeen
            FROM metricsDataset
            WHERE timestamp >= NOW() - INTERVAL '90' DAY
                AND timestamp < NOW()
                AND ${this.siteClause(siteId)}
                AND blob19 != ''
            GROUP BY blob19
            LIMIT 10000`);
        if (result.error) throw new Error(result.error);
        return result.data;
    }

    async getViewsGroupedByInterval(
        siteId: string,
        intervalType: "DAY" | "HOUR",
        startDateTime: Date, // start date/time in local timezone
        endDateTime: Date, // end date/time in local timezone
        tz?: string, // local timezone
        filters: SearchFilters = {},
    ): Promise<ViewsGroupedByInterval> {
        let intervalCount = 1;

        // keeping this code here once we start allowing bigger intervals (e.g. intervals of 2 hours)
        switch (intervalType) {
            case "DAY":
            case "HOUR":
                intervalCount = 1;
                break;
        }

        // note interval count hard-coded to hours at the moment
        const initialRows = generateEmptyRowsOverInterval(
            intervalType,
            startDateTime,
            endDateTime,
            tz,
        );

        const filterStr = filtersToSql(filters);

        // NOTE: when using toStartOfInterval, cannot group by other columns like double1 (isVisitor).
        //       This is just a limitation of Cloudflare Analytics Engine.
        //       -- but you can filter on them (using WHERE)

        // NOTE 2: Since CF AE doesn't support COALESCE, this query will not return
        //         rows (dates) where no hits were recorded -- which is why we need
        //         to generate empty buckets in JS (generateEmptyRowsOverInterval)
        //         and merge them with the results.

        const localStartTime = dayjs(startDateTime).tz(tz).utc();
        const localEndTime = dayjs(endDateTime).tz(tz).utc();

        const query = `
            SELECT SUM(_sample_interval) as count,

            /* interval start needs local timezone, e.g. 00:00 in America/New York means start of day in NYC */
            toStartOfInterval(timestamp, INTERVAL '${intervalCount}' ${intervalType}, '${tz}') as _bucket,
            ${ColumnMappings.newVisitor} as isVisitor,
            ${ColumnMappings.bounce} as isBounce,

            /* output as UTC */
            toDateTime(_bucket, 'Etc/UTC') as bucket
            FROM metricsDataset
            WHERE timestamp >= toDateTime('${localStartTime.format("YYYY-MM-DD HH:mm:ss")}')
								AND timestamp < toDateTime('${localEndTime.format("YYYY-MM-DD HH:mm:ss")}')
                AND ${ColumnMappings.siteId} = '${siteId}'
                ${filterStr}
            GROUP BY _bucket, isVisitor, isBounce
            ORDER BY _bucket ASC`;

        type SelectionSet = {
            count: number;
            bucket: string;
            isVisitor: number;
            isBounce: number;
        };

        const queryResult = this.query(query);
        const returnPromise = new Promise<[string, AnalyticsCountResult][]>(
            (resolve, reject) =>
                (async () => {
                    const response = await queryResult;

                    if (!response.ok) {
                        reject(response.statusText);
                    }

                    const responseData =
                        (await response.json()) as AnalyticsQueryResult<SelectionSet>;

                    // note this query will return sparse data (i.e. only rows where count > 0)
                    // merge returnedRows with initial rows to fill in any gaps
                    const rowsByDateTime = responseData.data.reduce(
                        (accum, row) => {
                            const utcDateTime = new Date(row["bucket"]);
                            const key = dayjs(utcDateTime).format(
                                "YYYY-MM-DD HH:mm:ss",
                            );
                            if (!Object.hasOwn(accum, key)) {
                                accum[key] = {
                                    views: 0,
                                    visitors: 0,
                                    bounces: 0,
                                };
                            }
                            accumulateCountsFromRowResult(accum[key], row);

                            return accum;
                        },
                        initialRows,
                    );

                    // return as sorted array of tuples (i.e. [datetime, count])
                    const sortedRows = Object.entries(rowsByDateTime).sort(
                        (a, b) => {
                            if (a[0] < b[0]) return -1;
                            else if (a[0] > b[0]) return 1;
                            else return 0;
                        },
                    );

                    // Fix negative bounce values coming from sparse values.
                    //
                    // If data is sparse, it's possible to have a bucket where a negative bounce value. This is because
                    // the initial "bounce" occurred in an earlier bucket. We need to go "back in time" and amend
                    // that bucket. Otherwise chart will show -100% bounce rate which makes no sense.
                    // (NOTE: The buckets must be sorted)
                    for (let i = 1; i < sortedRows.length; i++) {
                        const current = sortedRows[i][1];
                        // if the current value of bounces is negative, find the last non-zero bucket and decrement
                        if (current.bounces < 0) {
                            for (let j = i - 1; j >= 0; j--) {
                                const prev = sortedRows[j][1];
                                if (prev.bounces > 0) {
                                    prev.bounces += current.bounces;
                                    current.bounces = 0; // zero-out current bucket
                                    break;
                                }
                            }
                        }
                    }

                    resolve(sortedRows);
                })(),
        );
        return returnPromise;
    }

    async getCounts(
        siteId: string,
        interval: string,
        tz?: string,
        filters: SearchFilters = {},
    ) {
        // defaults to 1 day if not specified
        const siteIdColumn = ColumnMappings["siteId"];

        const { startIntervalSql, endIntervalSql } = intervalToSql(
            interval,
            tz,
        );

        const filterStr = filtersToSql(filters);

        const query = `
            SELECT SUM(_sample_interval) as count,
                ${ColumnMappings.newVisitor} as isVisitor,
                ${ColumnMappings.bounce} as isBounce
            FROM metricsDataset
            WHERE timestamp >= ${startIntervalSql} AND timestamp < ${endIntervalSql}
                ${filterStr}
            AND ${siteIdColumn} = '${siteId}'
            GROUP BY isVisitor, isBounce
            ORDER BY isVisitor, isBounce ASC`;

        type SelectionSet = {
            count: number;
            isVisitor: number;
            isBounce: number;
        };

        const queryResult = this.query(query);

        const returnPromise = new Promise<AnalyticsCountResult>(
            (resolve, reject) =>
                (async () => {
                    const response = await queryResult;

                    if (!response.ok) {
                        reject(response.statusText);
                    }

                    const responseData =
                        (await response.json()) as AnalyticsQueryResult<SelectionSet>;

                    const counts: AnalyticsCountResult = {
                        views: 0,
                        visitors: 0,
                        bounces: 0,
                    };

                    // NOTE: note it's possible to get no results, or half results (i.e. a row where isVisit=1 but
                    //       no row where isVisit=0), so this code makes no assumption on number of results
                    responseData.data.forEach((row) => {
                        accumulateCountsFromRowResult(counts, row);
                    });
                    resolve(counts);
                })(),
        );

        return returnPromise;
    }

    async getVisitorCountByColumn<T extends keyof typeof ColumnMappings>(
        siteId: string,
        column: T,
        interval: string,
        tz?: string,
        filters: SearchFilters = {},
        page: number = 1,
        limit: number = 10,
    ) {
        const { startIntervalSql, endIntervalSql } = intervalToSql(
            interval,
            tz,
        );

        const filterStr = filtersToSql(filters);

        const _column = ColumnMappings[column];
        const query = `
            SELECT ${_column}, SUM(_sample_interval) as count
            FROM metricsDataset
            WHERE timestamp >= ${startIntervalSql} AND timestamp < ${endIntervalSql}
                AND ${ColumnMappings.newVisitor} = 1
                AND ${ColumnMappings.siteId} = '${siteId}'
                ${filterStr}
            GROUP BY ${_column}
            ORDER BY count DESC
            LIMIT ${limit * page}`;

        type SelectionSet = {
            count: number;
        } & Record<
            (typeof ColumnMappings)[T],
            ColumnMappingToType<(typeof ColumnMappings)[T]>
        >;

        const queryResult = this.query(query);
        const returnPromise = new Promise<
            [ColumnMappingToType<typeof _column>, number][]
        >((resolve, reject) =>
            (async () => {
                const response = await queryResult;

                if (!response.ok) {
                    reject(response.statusText);
                }

                const responseData =
                    (await response.json()) as AnalyticsQueryResult<SelectionSet>;

                // since CF AE doesn't support OFFSET clauses, we select up to LIMIT and
                // then slice that into the individual requested page
                const pageData = responseData.data.slice(
                    limit * (page - 1),
                    limit * page,
                );

                resolve(
                    pageData.map((row) => {
                        const key = row[_column];
                        return [key, Number(row["count"])] as const;
                    }),
                );
            })(),
        );
        return returnPromise;
    }

    async getAllCountsByAllColumnsForAllSites(
        columns: (keyof typeof ColumnMappings)[],
        startDateTime: Date,
        endDateTime: Date,
        tz?: string,
    ): Promise<Map<string[], AnalyticsCountResult>> {
        const columnsStr = columns.map((c) => ColumnMappings[c]).join(", ");
        const columnsStrWithAliases = columns
            .map((c) => ColumnMappings[c] + " as " + c)
            .join(", ");

        const startDateTimeSql = dayjs(startDateTime)
            .tz(tz)
            .utc()
            .format("YYYY-MM-DD HH:mm:ss");
        const endDateTimeSql = dayjs(endDateTime)
            .tz(tz)
            .utc()
            .format("YYYY-MM-DD HH:mm:ss");

        const query = `
            SELECT 
                timestamp,
                SUM(_sample_interval) as count,
                ${ColumnMappings.siteId} as siteId, 
                ${ColumnMappings.newVisitor} as isVisitor, 
                ${ColumnMappings.bounce} as isBounce,
                ${columnsStrWithAliases}
            FROM metricsDataset
            WHERE timestamp >= toDateTime('${startDateTimeSql}') AND timestamp < toDateTime('${endDateTimeSql}')
            GROUP BY timestamp,
                ${ColumnMappings.siteId}, 
                ${ColumnMappings.newVisitor}, 
                ${ColumnMappings.bounce}, 
                ${columnsStr}
            ORDER BY count DESC
        `;

        type SelectionSet = {
            date: string;
            count: number;
            isVisitor: number;
            isBounce: number;
        } & {
            [K in keyof typeof ColumnMappings]: string;
        };

        return this.query(query).then(async (response) => {
            if (!response.ok) {
                throw new Error(response.status + response.statusText);
            }

            const responseData =
                (await response.json()) as AnalyticsQueryResult<SelectionSet>;


            return responseData.data.reduce((acc, row) => {
                // key is the comma joined string of siteId + all columns
                const key = [
                    row.date,
                    row.siteId,
                    ...columns.map((c) => String(row[c]).trim()),
                ];

                if (!acc.has(key)) {
                    acc.set(key, {
                        views: 0,
                        visitors: 0,
                        bounces: 0,
                    } as AnalyticsCountResult);
                }

                accumulateCountsFromRowResult(acc.get(key)!, row);
                return acc;
            }, new Map<string[], AnalyticsCountResult>());
        });
    }

    async getAllCountsByColumn<T extends keyof typeof ColumnMappings>(
        siteId: string,
        column: T,
        interval: string,
        tz?: string,
        filters: SearchFilters = {},
        page: number = 1,
        limit: number = 10,
    ): Promise<Record<string, AnalyticsCountResult>> {
        const { startIntervalSql, endIntervalSql } = intervalToSql(
            interval,
            tz,
            5,
            { inclusiveEnd: true },
        );

        const filterStr = filtersToSql(filters);
        const _column = ColumnMappings[column];
        // One grouped query avoids Analytics Engine failing on IN ('') for Direct
        // referrers / empty paths, and still ranks by visitors in JavaScript.
        const query = `
            SELECT ${_column},
                ${ColumnMappings.newVisitor} as isVisitor,
                SUM(_sample_interval) as count
            FROM metricsDataset
            WHERE timestamp >= ${startIntervalSql} AND timestamp < ${endIntervalSql}
                AND ${this.siteClause(siteId)}
                ${filterStr}
            GROUP BY ${_column}, ${ColumnMappings.newVisitor}
            ORDER BY count DESC
            LIMIT ${Math.max(limit * page * 4, 40)}`;

        type SelectionSet = {
            count: number;
            isVisitor: number;
            isBounce: number;
        } & Record<
            (typeof ColumnMappings)[T],
            ColumnMappingToType<(typeof ColumnMappings)[T]>
        >;

        const result = await this.querySql<SelectionSet>(query);
        if (result.error) {
            throw new Error(result.error);
        }

        const merged = result.data.reduce(
            (acc, row) => {
                const key = String(row[_column] ?? "");
                if (!Object.hasOwn(acc, key)) {
                    acc[key] = {
                        views: 0,
                        visitors: 0,
                        bounces: 0,
                    } as AnalyticsCountResult;
                }

                accumulateCountsFromRowResult(acc[key], row);
                return acc;
            },
            {} as Record<string, AnalyticsCountResult>,
        );

        const ranked = Object.entries(merged).sort(
            (a, b) => b[1].visitors - a[1].visitors || b[1].views - a[1].views,
        );
        const pageRows = ranked.slice(limit * (page - 1), limit * page);
        return Object.fromEntries(pageRows);
    }

    async getCountByPath(
        siteId: string,
        interval: string,
        tz?: string,
        filters: SearchFilters = {},
        page: number = 1,
        limit: number = 10,
    ): Promise<[path: string, visitors: number, views: number][]> {
        const allCountsResultPromise = this.getAllCountsByColumn(
            siteId,
            "path",
            interval,
            tz,
            filters,
            page,
            limit,
        );

        return allCountsResultPromise.then((allCountsResult) => {
            const result: [string, number, number][] = [];
            for (const [key] of Object.entries(allCountsResult)) {
                const record = allCountsResult[key];
                result.push([key, record.visitors, record.views]);
            }
            // sort by visitors
            return result.sort((a, b) => b[1] - a[1]);
        });
    }

    async getCountByHost(
        siteId: string,
        interval: string,
        tz?: string,
        filters: SearchFilters = {},
        page: number = 1,
        limit: number = 10,
    ): Promise<[host: string, visitors: number, views: number][]> {
        const allCountsResult = await this.getAllCountsByColumn(
            siteId,
            "host",
            interval,
            tz,
            filters,
            page,
            limit,
        );

        return Object.entries(allCountsResult)
            .map(([host, counts]) => [host, counts.visitors, counts.views] as [string, number, number])
            .sort((a, b) => b[1] - a[1]);
    }

    async getCountByCountry(
        siteId: string,
        interval: string,
        tz?: string,
        filters: SearchFilters = {},
        page: number = 1,
    ): Promise<[country: string, visitors: number][]> {
        return this.getVisitorCountByColumn(
            siteId,
            "country",
            interval,
            tz,
            filters,
            page,
        );
    }

    async getCountByRegion(
        siteId: string,
        interval: string,
        tz?: string,
        filters: SearchFilters = {},
        page: number = 1,
    ): Promise<[region: string, visitors: number][]> {
        return this.getVisitorCountByColumn(siteId, "region", interval, tz, filters, page);
    }

    async getCountByOperatingSystem(
        siteId: string,
        interval: string,
        tz?: string,
        filters: SearchFilters = {},
        page: number = 1,
    ): Promise<[operatingSystem: string, visitors: number][]> {
        return this.getVisitorCountByColumn(siteId, "operatingSystem", interval, tz, filters, page);
    }

    async getSessionCount(
        siteId: string,
        interval: string,
        tz?: string,
        filters: SearchFilters = {},
    ): Promise<number> {
        const { startIntervalSql, endIntervalSql } = intervalToSql(interval, tz);
        const filterStr = filtersToSql(filters);
        const query = `
            SELECT SUM(_sample_interval * ${ColumnMappings.newSession}) as sessions
            FROM metricsDataset
            WHERE timestamp >= ${startIntervalSql} AND timestamp < ${endIntervalSql}
                AND ${ColumnMappings.siteId} = '${siteId}'
                ${filterStr}`;
        const response = await this.query(query);
        if (!response.ok) throw new Error(response.statusText);
        const result = (await response.json()) as AnalyticsQueryResult<{ sessions: number }>;
        return Number(result.data[0]?.sessions || 0);
    }

    async getCountByReferrer(
        siteId: string,
        interval: string,
        tz?: string,
        filters: SearchFilters = {},
        page: number = 1,
        limit: number = 10,
    ): Promise<[referrer: string, visitors: number, views: number][]> {
        const allCountsResultPromise = this.getAllCountsByColumn(
            siteId,
            "referrer",
            interval,
            tz,
            filters,
            page,
            limit,
        );

        return allCountsResultPromise.then((allCountsResult) => {
            const result: [string, number, number][] = [];
            for (const [key] of Object.entries(allCountsResult)) {
                const record = allCountsResult[key];
                result.push([key, record.visitors, record.views]);
            }
            // sort by visitors
            return result.sort((a, b) => b[1] - a[1]);
        });
    }

    async getCountByBrowser(
        siteId: string,
        interval: string,
        tz?: string,
        filters: SearchFilters = {},
        page: number = 1,
    ): Promise<[browser: string, visitors: number][]> {
        return this.getVisitorCountByColumn(
            siteId,
            "browserName",
            interval,
            tz,
            filters,
            page,
        );
    }

    async getCountByBrowserVersion(
        siteId: string,
        interval: string,
        tz?: string,
        filters: SearchFilters = {},
        page: number = 1,
    ): Promise<[browser: string, visitors: number][]> {
        return this.getVisitorCountByColumn(
            siteId,
            "browserVersion",
            interval,
            tz,
            filters,
            page,
        );
    }

    async getCountByDeviceModel(
        siteId: string,
        interval: string,
        tz?: string,
        filters: SearchFilters = {},
        page: number = 1,
    ): Promise<[deviceModel: string, visitors: number][]> {
        return this.getVisitorCountByColumn(
            siteId,
            "deviceModel",
            interval,
            tz,
            filters,
            page,
        );
    }

    async getCountByDeviceType(
        siteId: string,
        interval: string,
        tz?: string,
        filters: SearchFilters = {},
        page: number = 1,
    ): Promise<[deviceType: string, visitors: number][]> {
        return this.getVisitorCountByColumn(
            siteId,
            "deviceType",
            interval,
            tz,
            filters,
            page,
        );
    }

    async getCountByUtmSource(
        siteId: string,
        interval: string,
        tz?: string,
        filters: SearchFilters = {},
        page: number = 1,
    ): Promise<[utmSource: string, visitors: number][]> {
        return this.getVisitorCountByColumn(
            siteId,
            "utmSource",
            interval,
            tz,
            filters,
            page,
        );
    }

    async getCountByUtmMedium(
        siteId: string,
        interval: string,
        tz?: string,
        filters: SearchFilters = {},
        page: number = 1,
    ): Promise<[utmMedium: string, visitors: number][]> {
        return this.getVisitorCountByColumn(
            siteId,
            "utmMedium",
            interval,
            tz,
            filters,
            page,
        );
    }

    async getCountByUtmCampaign(
        siteId: string,
        interval: string,
        tz?: string,
        filters: SearchFilters = {},
        page: number = 1,
    ): Promise<[utmCampaign: string, visitors: number][]> {
        return this.getVisitorCountByColumn(
            siteId,
            "utmCampaign",
            interval,
            tz,
            filters,
            page,
        );
    }

    async getCountByUtmTerm(
        siteId: string,
        interval: string,
        tz?: string,
        filters: SearchFilters = {},
        page: number = 1,
    ): Promise<[utmTerm: string, visitors: number][]> {
        return this.getVisitorCountByColumn(
            siteId,
            "utmTerm",
            interval,
            tz,
            filters,
            page,
        );
    }

    async getCountByUtmContent(
        siteId: string,
        interval: string,
        tz?: string,
        filters: SearchFilters = {},
        page: number = 1,
    ): Promise<[utmContent: string, visitors: number][]> {
        return this.getVisitorCountByColumn(
            siteId,
            "utmContent",
            interval,
            tz,
            filters,
            page,
        );
    }

    async getSitesOrderedByHits(interval: string, limit?: number) {
        // defaults to 1 day if not specified

        limit = limit || 10;

        const { startIntervalSql, endIntervalSql } = intervalToSql(interval, undefined, 5, { inclusiveEnd: true });

        const query = `
            SELECT SUM(_sample_interval) as count,
                ${ColumnMappings.siteId} as siteId
            FROM metricsDataset
            WHERE timestamp >= ${startIntervalSql} AND timestamp < ${endIntervalSql}
            GROUP BY siteId
            ORDER BY count DESC
            LIMIT ${limit}
        `;

        type SelectionSet = {
            count: number;
            siteId: string;
        };

        const queryResult = this.query(query);
        const returnPromise = new Promise<[string, number][]>(
            (resolve, reject) =>
                (async () => {
                    const response = await queryResult;

                    if (!response.ok) {
                        reject(response.statusText);
                        return;
                    }

                    const responseData =
                        (await response.json()) as AnalyticsQueryResult<SelectionSet>;
                    const result = responseData.data.reduce(
                        (acc, cur) => {
                            acc.push([cur["siteId"], cur["count"]]);
                            return acc;
                        },
                        [] as [string, number][],
                    );

                    resolve(result);
                })(),
        );
        return returnPromise;
    }

    async getEarliestEvents(siteId: string): Promise<{
        earliestEvent: Date | null;
        earliestBounce: Date | null;
    }> {
        const query = `
            SELECT
                MIN(timestamp) as earliestEvent,
                ${ColumnMappings.bounce} as isBounce
            FROM metricsDataset
            WHERE ${ColumnMappings.siteId} = '${siteId}'
            GROUP by isBounce
        `;

        type SelectionSet = {
            earliestEvent: string;
            isBounce: number;
        };
        const queryResult = this.query(query);
        const returnPromise = new Promise<{
            earliestEvent: Date | null;
            earliestBounce: Date | null;
        }>((resolve, reject) => {
            (async () => {
                const response = await queryResult;

                if (!response.ok) {
                    reject(response.statusText);
                    return;
                }

                const responseData =
                    (await response.json()) as AnalyticsQueryResult<SelectionSet>;

                const data = responseData.data;

                const earliestEvent = data.find(
                    (row) => row["isBounce"] === 0,
                )?.earliestEvent;

                const earliestBounce = data.find(
                    (row) => row["isBounce"] === 1,
                )?.earliestEvent;

                resolve({
                    earliestEvent: earliestEvent
                        ? new Date(earliestEvent)
                        : null,
                    earliestBounce: earliestBounce
                        ? new Date(earliestBounce)
                        : null,
                });
            })();
        });

        return returnPromise;
    }
}

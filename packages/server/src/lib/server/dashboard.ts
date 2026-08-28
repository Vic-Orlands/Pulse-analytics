import dayjs from "dayjs";
import { AnalyticsEngineAPI } from "~/analytics/query";
import type { DashboardData } from "$lib/types";
import {
    formatHostLabel,
    formatPathLabel,
    formatReferrerLabel,
    presentCountRows,
    presentEvents,
} from "./present";
import {
    countEventType,
    emptyInsights,
    presentAlerts,
    presentCopySnippets,
    presentFunnel,
    presentLinkRows,
    presentLiveVisitors,
    presentSessionInsights,
    uniqueSessionCount,
} from "./insights";
import { demoDashboard } from "./demo";

const intervals = new Set([
    "today",
    "yesterday",
    "1d",
    "7d",
    "14d",
    "30d",
    "90d",
]);
const dashboardCache = new Map<
    string,
    { data: DashboardData; expiresAt: number }
>();
const dashboardRequests = new Map<string, Promise<DashboardData>>();
const dashboardCacheTtlMs = 120_000;
const siteListCacheTtlMs = 10 * 60_000;
const hiddenSites = new Set(["install-test", "probe"]);
const siteListCache = new Map<string, { sites: string[]; expiresAt: number }>();

export function isHiddenSite(site: string): boolean {
    return hiddenSites.has(site.trim().toLowerCase());
}

export function clearDashboardCaches(): void {
    dashboardCache.clear();
    dashboardRequests.clear();
    siteListCache.clear();
}

export function visibleSites(sites: string[]): string[] {
    return [...new Set(sites.map((site) => site.trim()).filter(Boolean))].filter(
        (site) => !isHiddenSite(site),
    );
}

function normalizeRoutes(
    rows: DashboardData["pages"],
): DashboardData["routes"] {
    const grouped = new Map<string, [number, number]>();

    for (const [path, visitors, views = visitors] of rows) {
        const route = (path || "/")
            .split("?")[0]
            .split("/")
            .map((segment) =>
                /^(\d+|[0-9a-f]{8,}|[A-Za-z0-9_-]{20,})$/i.test(segment)
                    ? ":id"
                    : segment,
            )
            .join("/");
        const current = grouped.get(route) ?? [0, 0];
        grouped.set(route, [current[0] + visitors, current[1] + views]);
    }

    return Array.from(
        grouped,
        ([route, counts]) =>
            [route, counts[0], counts[1]] as [string, number, number],
    ).sort((a, b) => b[1] - a[1]);
}

function rangeFor(interval: string) {
    const now = dayjs();
    if (interval === "today") {
        return { start: now.startOf("day"), end: now, type: "HOUR" as const };
    }
    if (interval === "yesterday") {
        return {
            start: now.subtract(1, "day").startOf("day"),
            end: now.startOf("day"),
            type: "HOUR" as const,
        };
    }
    if (interval === "1d") {
        return {
            start: now.subtract(1, "day"),
            end: now,
            type: "HOUR" as const,
        };
    }
    const days = Number(interval.replace("d", "")) || 7;
    return {
        start: now.subtract(days - 1, "day").startOf("day"),
        end: now.add(1, "day").startOf("day"),
        type: "DAY" as const,
    };
}

function utmRows(rows: [string, number][]) {
    return presentCountRows(
        rows.map(([label, visitors]) => [
            label || "(none)",
            visitors,
            visitors,
        ]),
        (label) => label || "(none)",
    );
}

function unavailable(
    siteId: string,
    interval: string,
    sites: string[],
    warning?: string,
): DashboardData {
    return {
        source: "unavailable",
        siteId,
        sites,
        interval,
        generatedAt: new Date().toISOString(),
        stats: {
            views: 0,
            visitors: 0,
            sessions: 0,
            bounces: 0,
            bounceRate: 0,
            pagesPerVisit: 0,
            previousVisitors: 0,
        },
        series: [],
        pages: [],
        routes: [],
        hostnames: [],
        referrers: [],
        countries: [],
        regions: [],
        browsers: [],
        browserVersions: [],
        operatingSystems: [],
        devices: [],
        events: [],
        ...emptyInsights(),
        warnings: warning
            ? [warning]
            : [
                  "Cloudflare Analytics Engine credentials are not configured on this Worker.",
              ],
    };
}

async function loadSiteList(
    api: AnalyticsEngineAPI,
    configuredSites: string[],
    warnings: string[],
): Promise<string[]> {
    const cacheKey = configuredSites.join(",");
    const cached = siteListCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
        return visibleSites(cached.sites);
    }

    const discoveredSites = await api
        .getSitesOrderedByHits("90d", 50)
        .catch((error) => {
            const message =
                error instanceof Error ? error.message : String(error);
            warnings.push(
                `apps: ${message || "Cloudflare Analytics Engine query failed"}`,
            );
            return [];
        });
    const sites = visibleSites([
        ...configuredSites,
        ...discoveredSites.map(([site]) => site),
    ]);
    siteListCache.set(cacheKey, {
        sites,
        expiresAt: Date.now() + siteListCacheTtlMs,
    });
    return sites;
}

async function loadDashboardData(
    url: URL,
    env?: App.Platform["env"],
    surface: "dashboard" | "signals" = "dashboard",
): Promise<DashboardData> {
    const configuredSites = visibleSites(
        (env?.PUBLIC_SITE_IDS || "").split(","),
    );
    const requestedInterval = url.searchParams.get("interval") || "7d";
    const interval = intervals.has(requestedInterval)
        ? requestedInterval
        : "7d";
    const requestedParam = (url.searchParams.get("site") || "").trim();
    const requestedSite =
        requestedParam && !isHiddenSite(requestedParam)
            ? requestedParam
            : "";

    if (!env?.CF_ACCOUNT_ID || !env.CF_BEARER_TOKEN) {
        if (import.meta.env.DEV) {
            return demoDashboard({
                siteId: requestedSite || configuredSites[0] || "",
                interval,
                sites: visibleSites(configuredSites),
            });
        }
        return unavailable(requestedSite, interval, configuredSites);
    }

    const warnings: string[] = [];
    try {
        const api = new AnalyticsEngineAPI(env.CF_ACCOUNT_ID, env.CF_BEARER_TOKEN);
    const sitesPromise = loadSiteList(api, configuredSites, warnings);
    let siteIdGuess = requestedSite || configuredSites[0] || "";
    if (!siteIdGuess) {
        siteIdGuess = (await sitesPromise)[0] || "";
    }
    const range = rangeFor(interval);
    const rangeDuration = range.end.diff(range.start, "millisecond");
    const previousRange = {
        start: range.start.subtract(rangeDuration, "millisecond"),
        end: range.start,
    };
    const timezone = "Africa/Lagos";

    if (!siteIdGuess) {
        return {
            ...unavailable(
                "",
                interval,
                [],
                "Install tracking to create an app.",
            ),
            source: "live",
        };
    }

    const note = async <T>(
        label: string,
        fallback: T,
        task: Promise<T>,
    ): Promise<T> => {
        try {
            return await task;
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);
            warnings.push(`${label}: ${message}`);
            console.error(`Pulse analytics query failed (${label})`, error);
            return fallback;
        }
    };

    if (surface === "signals") {
        const [sites, eventRows] = await Promise.all([
            sitesPromise,
            note("events", [], api.getEvents(siteIdGuess, interval, timezone)),
        ]);
        const siteId = sites.includes(siteIdGuess)
            ? siteIdGuess
            : sites[0] || siteIdGuess;
        if (
            eventRows.length === 0 &&
            warnings.some((warning) => warning.startsWith("events:"))
        ) {
            warnings.push("Signals could not load.");
        }
        return {
            ...unavailable(siteId, interval, sites),
            source: "live",
            events: presentEvents(eventRows),
            warnings,
        };
    }

    const [
        sites,
        counts,
        sessionCount,
        seriesRows,
        previousSeriesRows,
        pages,
        hostnames,
        referrers,
        countries,
        regions,
        browsers,
        operatingSystems,
        devices,
        sessionPaths,
        liveRows,
        copyRows,
        outboundRows,
        downloadRows,
        eventTypeCounts,
        convertedSessions,
        utmSources,
        utmMediums,
        utmCampaigns,
    ] = await Promise.all([
        sitesPromise,
        note(
            "counts",
            { views: 0, visitors: 0, bounces: 0 },
            api.getCounts(siteIdGuess, interval, timezone),
        ),
        note("sessions", 0, api.getSessionCount(siteIdGuess, interval, timezone)),
        note(
            "series",
            [],
            api.getViewsGroupedByInterval(
                siteIdGuess,
                range.type,
                range.start.toDate(),
                range.end.toDate(),
                timezone,
            ),
        ),
        note(
            "previous-series",
            [],
            api.getViewsGroupedByInterval(
                siteIdGuess,
                range.type,
                previousRange.start.toDate(),
                previousRange.end.toDate(),
                timezone,
            ),
        ),
        note(
            "pages",
            [],
            api.getCountByPath(siteIdGuess, interval, timezone, {}, 1, 20),
        ),
        note(
            "hosts",
            [],
            api.getCountByHost(siteIdGuess, interval, timezone, {}, 1, 20),
        ),
        note(
            "referrers",
            [],
            api.getCountByReferrer(siteIdGuess, interval, timezone, {}, 1, 20),
        ),
        note(
            "countries",
            [],
            api.getCountByCountry(siteIdGuess, interval, timezone),
        ),
        note("regions", [], api.getCountByRegion(siteIdGuess, interval, timezone)),
        note("browsers", [], api.getCountByBrowser(siteIdGuess, interval, timezone)),
        note(
            "operating-systems",
            [],
            api.getCountByOperatingSystem(siteIdGuess, interval, timezone),
        ),
        note(
            "devices",
            [],
            api.getCountByDeviceType(siteIdGuess, interval, timezone),
        ),
        note("journeys", [], api.getSessionPaths(siteIdGuess, interval, timezone)),
        note("live", [], api.getLiveActivity(siteIdGuess)),
        note(
            "copies",
            [],
            api.getEventValues(siteIdGuess, interval, "copy", timezone),
        ),
        note(
            "outbound",
            [],
            api.getEventValues(siteIdGuess, interval, "outbound", timezone),
        ),
        note(
            "downloads",
            [],
            api.getEventValues(siteIdGuess, interval, "download", timezone),
        ),
        note(
            "event-types",
            [],
            api.getEventTypeCounts(siteIdGuess, interval, timezone),
        ),
        note(
            "converted-sessions",
            [],
            api.getConvertedSessions(siteIdGuess, interval, timezone),
        ),
        note(
            "utm-source",
            [],
            api.getCountByUtmSource(siteIdGuess, interval, timezone),
        ),
        note(
            "utm-medium",
            [],
            api.getCountByUtmMedium(siteIdGuess, interval, timezone),
        ),
        note(
            "utm-campaign",
            [],
            api.getCountByUtmCampaign(siteIdGuess, interval, timezone),
        ),
    ]);
    const siteId = sites.includes(siteIdGuess)
        ? siteIdGuess
        : sites[0] || siteIdGuess;

    const sessions = sessionCount || counts.visitors;
    const bounceRate =
        sessions > 0 ? Math.max(0, counts.bounces / sessions) * 100 : 0;
    const previousVisitors = previousSeriesRows.reduce(
        (sum, [, point]) => sum + point.visitors,
        0,
    );
    const labeledPages = presentCountRows(pages, formatPathLabel);
    const sessionInsights = presentSessionInsights(sessionPaths);
    const live = presentLiveVisitors(liveRows);
    const copies = presentCopySnippets(copyRows);
    const outbound = presentLinkRows(outboundRows);
    const downloads = presentLinkRows(downloadRows);
    const funnel = presentFunnel({
        sessions,
        engagedSessions: sessionInsights.engagedSessions,
        convertedSessions: uniqueSessionCount(convertedSessions),
    });
    const alerts = presentAlerts({
        scrapeCount: countEventType(eventTypeCounts, "scrape"),
        copies,
        liveVisitors: live.visitors,
        bounceRate,
        sessions,
    });

    if (counts.views > 0 && labeledPages.length === 0) {
        warnings.push("Pageviews recorded, but no pages came back.");
    }
    if (counts.views > 0 && referrers.length === 0) {
        warnings.push("Pageviews recorded, but no referrers came back.");
    }

    return {
        source: "live",
        siteId,
        sites,
        interval,
        generatedAt: new Date().toISOString(),
        stats: {
            ...counts,
            sessions,
            bounceRate,
            pagesPerVisit: sessions > 0 ? counts.views / sessions : 0,
            previousVisitors,
        },
        series: seriesRows.map(([date, point], index) => ({
            date: new Date(date),
            ...point,
            previousViews: previousSeriesRows[index]?.[1].views ?? 0,
            previousVisitors: previousSeriesRows[index]?.[1].visitors ?? 0,
        })),
        pages: labeledPages,
        routes: presentCountRows(
            normalizeRoutes(labeledPages),
            (label) => label,
        ),
        hostnames: presentCountRows(hostnames, formatHostLabel),
        referrers: presentCountRows(referrers, formatReferrerLabel),
        countries,
        regions,
        browsers,
        browserVersions: [],
        operatingSystems,
        devices,
        events: [],
        live,
        journeys: sessionInsights.journeys,
        entries: sessionInsights.entries,
        exits: sessionInsights.exits,
        utmSources: utmRows(utmSources),
        utmMediums: utmRows(utmMediums),
        utmCampaigns: utmRows(utmCampaigns),
        copies,
        outbound,
        downloads,
        funnel,
        bounceByLanding: sessionInsights.bounceByLanding,
        alerts,
        cohorts: { newVisitors: 0, returningVisitors: 0 },
        warnings,
    };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Pulse dashboard failed", error);
        return unavailable(
            requestedSite,
            interval,
            configuredSites,
            `dashboard: ${message || "Unexpected analytics error"}`,
        );
    }
}

export async function getDashboardData(
    url: URL,
    env?: App.Platform["env"],
    surface: "dashboard" | "signals" = "dashboard",
): Promise<DashboardData> {
    const cacheKey = [
        env?.CF_ACCOUNT_ID || "",
        env?.PUBLIC_SITE_IDS || "",
        url.searchParams.get("site") || "",
        url.searchParams.get("interval") || "7d",
        surface,
    ].join(":");
    const cached = dashboardCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.data;

    const pending = dashboardRequests.get(cacheKey);
    if (pending) return pending;

    const request = loadDashboardData(url, env, surface);
    dashboardRequests.set(cacheKey, request);

    try {
        const data = await request;
        const rateLimited = data.warnings.some((warning) =>
            /too many requests|rate limit/i.test(warning),
        );
        if (!rateLimited) {
            dashboardCache.set(cacheKey, {
                data,
                expiresAt: Date.now() + dashboardCacheTtlMs,
            });
        }
        return data;
    } finally {
        dashboardRequests.delete(cacheKey);
    }
}

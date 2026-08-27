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

const intervals = new Set(["today", "yesterday", "1d", "7d", "14d", "30d", "90d"]);

function normalizeRoutes(rows: DashboardData["pages"]): DashboardData["routes"] {
    const grouped = new Map<string, [number, number]>();

    for (const [path, visitors, views = visitors] of rows) {
        const route = (path || "/")
            .split("?")[0]
            .split("/")
            .map((segment) => (/^(\d+|[0-9a-f]{8,}|[A-Za-z0-9_-]{20,})$/i.test(segment) ? ":id" : segment))
            .join("/");
        const current = grouped.get(route) ?? [0, 0];
        grouped.set(route, [current[0] + visitors, current[1] + views]);
    }

    return Array.from(grouped, ([route, counts]) => [route, counts[0], counts[1]] as [string, number, number])
        .sort((a, b) => b[1] - a[1]);
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
        return { start: now.subtract(1, "day"), end: now, type: "HOUR" as const };
    }
    const days = Number(interval.replace("d", "")) || 7;
    return {
        start: now.subtract(days - 1, "day").startOf("day"),
        end: now.add(1, "day").startOf("day"),
        type: "DAY" as const,
    };
}

function unavailable(siteId: string, interval: string, sites: string[]): DashboardData {
    return {
        source: "unavailable",
        siteId,
        sites,
        interval,
        generatedAt: new Date().toISOString(),
        stats: { views: 0, visitors: 0, sessions: 0, bounces: 0, bounceRate: 0, pagesPerVisit: 0, previousVisitors: 0 },
        series: [], pages: [], routes: [], hostnames: [], referrers: [], countries: [], regions: [], browsers: [], browserVersions: [], operatingSystems: [], devices: [], events: [],
        warnings: ["Cloudflare Analytics Engine credentials are not configured on this Worker."],
    };
}

export async function getDashboardData(url: URL, env?: App.Platform["env"]): Promise<DashboardData> {
    const configuredSites = (env?.PUBLIC_SITE_IDS || "")
        .split(",")
        .map((site) => site.trim())
        .filter(Boolean);
    const requestedInterval = url.searchParams.get("interval") || "7d";
    const interval = intervals.has(requestedInterval) ? requestedInterval : "7d";
    const requestedSite = url.searchParams.get("site") || configuredSites[0] || "";

    if (!env?.CF_ACCOUNT_ID || !env.CF_BEARER_TOKEN) {
        return unavailable(requestedSite, interval, configuredSites);
    }

    const api = new AnalyticsEngineAPI(env.CF_ACCOUNT_ID, env.CF_BEARER_TOKEN);
    const discoveredSites = await api.getSitesOrderedByHits("90d", 50).catch(() => []);
    const sites = Array.from(new Set([...configuredSites, ...discoveredSites.map(([site]) => site)])).filter(Boolean);
    const siteId = sites.includes(requestedSite) ? requestedSite : sites[0] || requestedSite;
    const range = rangeFor(interval);
    const rangeDuration = range.end.diff(range.start, "millisecond");
    const previousRange = {
        start: range.start.subtract(rangeDuration, "millisecond"),
        end: range.start,
    };
    const timezone = "Africa/Lagos";

    const warnings: string[] = [];
    const note = async <T>(label: string, fallback: T, task: Promise<T>): Promise<T> => {
        try {
            return await task;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            warnings.push(`${label}: ${message}`);
            console.error(`Pulse analytics query failed (${label})`, error);
            return fallback;
        }
    };

    const [counts, sessionCount, seriesRows, previousSeriesRows, pages, hostnames, referrers, countries, regions, browsers, browserVersions, operatingSystems, devices, eventRows] =
        await Promise.all([
            note("counts", { views: 0, visitors: 0, bounces: 0 }, api.getCounts(siteId, interval, timezone)),
            note("sessions", 0, api.getSessionCount(siteId, interval, timezone)),
            note("series", [], api.getViewsGroupedByInterval(siteId, range.type, range.start.toDate(), range.end.toDate(), timezone)),
            note("previous-series", [], api.getViewsGroupedByInterval(siteId, range.type, previousRange.start.toDate(), previousRange.end.toDate(), timezone)),
            note("pages", [], api.getCountByPath(siteId, interval, timezone, {}, 1, 20)),
            note("hosts", [], api.getCountByHost(siteId, interval, timezone, {}, 1, 20)),
            note("referrers", [], api.getCountByReferrer(siteId, interval, timezone, {}, 1, 20)),
            note("countries", [], api.getCountByCountry(siteId, interval, timezone)),
            note("regions", [], api.getCountByRegion(siteId, interval, timezone)),
            note("browsers", [], api.getCountByBrowser(siteId, interval, timezone)),
            note("browser-versions", [], api.getCountByBrowserVersion(siteId, interval, timezone)),
            note("operating-systems", [], api.getCountByOperatingSystem(siteId, interval, timezone)),
            note("devices", [], api.getCountByDeviceType(siteId, interval, timezone)),
            note("events", [], api.getEvents(siteId, interval, timezone)),
        ]);

    const sessions = sessionCount || counts.visitors;
    const bounceRate = sessions > 0 ? Math.max(0, counts.bounces / sessions) * 100 : 0;
    const previousVisitors = previousSeriesRows.reduce((sum, [, point]) => sum + point.visitors, 0);
    const labeledPages = presentCountRows(pages, formatPathLabel);

    if (counts.views > 0 && labeledPages.length === 0) {
        warnings.push("Pageviews were recorded, but the pages query returned no rows.");
    }
    if (counts.views > 0 && referrers.length === 0) {
        warnings.push("Pageviews were recorded, but the referrer query returned no rows.");
    }
    if (eventRows.length === 0 && warnings.some((warning) => warning.startsWith("events:"))) {
        warnings.push("Signal Ledger could not read eventsDataset. Confirm the WEB_EVENTS_AE Worker binding is deployed.");
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
        routes: presentCountRows(normalizeRoutes(labeledPages), (label) => label),
        hostnames: presentCountRows(hostnames, formatHostLabel),
        referrers: presentCountRows(referrers, formatReferrerLabel),
        countries,
        regions,
        browsers,
        browserVersions,
        operatingSystems,
        devices,
        events: presentEvents(eventRows),
        warnings,
    };
}

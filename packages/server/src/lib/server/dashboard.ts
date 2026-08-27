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

    const [counts, sessionCount, seriesRows, previousSeriesRows, pages, hostnames, referrers, countries, regions, browsers, browserVersions, operatingSystems, devices, eventRows] =
        await Promise.all([
            api.getCounts(siteId, interval, timezone).catch(() => ({ views: 0, visitors: 0, bounces: 0 })),
            api.getSessionCount(siteId, interval, timezone).catch(() => 0),
            api.getViewsGroupedByInterval(siteId, range.type, range.start.toDate(), range.end.toDate(), timezone).catch(() => []),
            api.getViewsGroupedByInterval(siteId, range.type, previousRange.start.toDate(), previousRange.end.toDate(), timezone).catch(() => []),
            api.getCountByPath(siteId, interval, timezone, {}, 1, 20).catch(() => []),
            api.getCountByHost(siteId, interval, timezone, {}, 1, 20).catch(() => []),
            api.getCountByReferrer(siteId, interval, timezone, {}, 1, 20).catch(() => []),
            api.getCountByCountry(siteId, interval, timezone).catch(() => []),
            api.getCountByRegion(siteId, interval, timezone).catch(() => []),
            api.getCountByBrowser(siteId, interval, timezone).catch(() => []),
            api.getCountByBrowserVersion(siteId, interval, timezone).catch(() => []),
            api.getCountByOperatingSystem(siteId, interval, timezone).catch(() => []),
            api.getCountByDeviceType(siteId, interval, timezone).catch(() => []),
            api.getEvents(siteId, interval, timezone).catch(() => []),
        ]);

    const sessions = sessionCount || counts.visitors;
    const bounceRate = sessions > 0 ? Math.max(0, counts.bounces / sessions) * 100 : 0;
    const previousVisitors = previousSeriesRows.reduce((sum, [, point]) => sum + point.visitors, 0);

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
        pages: presentCountRows(pages, formatPathLabel),
        routes: presentCountRows(normalizeRoutes(pages), formatPathLabel),
        hostnames: presentCountRows(hostnames, formatHostLabel),
        referrers: presentCountRows(referrers, formatReferrerLabel),
        countries,
        regions,
        browsers,
        browserVersions,
        operatingSystems,
        devices,
        events: presentEvents(eventRows),
    };
}

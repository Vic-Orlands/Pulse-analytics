import dayjs from "dayjs";
import { AnalyticsEngineAPI } from "~/analytics/query";
import type { DashboardData, TrafficPoint } from "$lib/types";

const intervals = new Set(["today", "yesterday", "1d", "7d", "30d", "90d"]);

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

function preview(siteId: string, interval: string, sites: string[]): DashboardData {
    const days = interval === "90d" ? 30 : interval === "30d" ? 30 : 7;
    const seed = siteId.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
    const series: TrafficPoint[] = Array.from({ length: days }, (_, index) => {
        const wave = Math.sin((index + seed) * 0.82) * 18;
        const views = Math.max(8, Math.round(64 + wave + ((index * 11 + seed) % 27)));
        return {
            date: dayjs().subtract(days - index - 1, "day").startOf("day").toDate(),
            views,
            visitors: Math.round(views * 0.64),
        };
    });
    const views = series.reduce((sum, point) => sum + point.views, 0);
    const visitors = series.reduce((sum, point) => sum + point.visitors, 0);
    const sessions = Math.round(visitors * 1.08);
    const bounces = Math.round(sessions * 0.38);

    return {
        source: "preview",
        siteId,
        sites,
        interval,
        generatedAt: new Date().toISOString(),
        stats: {
            views,
            visitors,
            sessions,
            bounces,
            bounceRate: (bounces / sessions) * 100,
            pagesPerVisit: views / sessions,
        },
        series,
        pages: [["/", 382, 614], ["/works", 174, 241], ["/writings", 123, 198], ["/about", 86, 117]],
        referrers: [["Google", 241, 316], ["Direct", 196, 283], ["x.com", 72, 94], ["github.com", 51, 68]],
        countries: [["NG", 292], ["US", 176], ["GB", 74], ["DE", 41]],
        regions: [["Lagos", 183], ["California", 74], ["England", 61], ["Abuja FCT", 52]],
        browsers: [["Chrome", 312], ["Safari", 174], ["Firefox", 73], ["Edge", 38]],
        operatingSystems: [["Windows", 214], ["iOS", 143], ["Android", 127], ["macOS", 96]],
        devices: [["desktop", 341], ["mobile", 228], ["tablet", 24]],
    };
}

export async function getDashboardData(url: URL, env?: App.Platform["env"]): Promise<DashboardData> {
    const configuredSites = (env?.PUBLIC_SITE_IDS || "portfolio,sleeksign,pulse")
        .split(",")
        .map((site) => site.trim())
        .filter(Boolean);
    const requestedInterval = url.searchParams.get("interval") || "7d";
    const interval = intervals.has(requestedInterval) ? requestedInterval : "7d";
    const requestedSite = url.searchParams.get("site") || configuredSites[0] || "portfolio";

    if (!env?.CF_ACCOUNT_ID || !env.CF_BEARER_TOKEN) {
        return preview(requestedSite, interval, configuredSites);
    }

    const api = new AnalyticsEngineAPI(env.CF_ACCOUNT_ID, env.CF_BEARER_TOKEN);
    const discoveredSites = await api.getSitesOrderedByHits("90d", 50).catch(() => []);
    const sites = Array.from(new Set([...configuredSites, ...discoveredSites.map(([site]) => site)])).filter(Boolean);
    const siteId = sites.includes(requestedSite) ? requestedSite : sites[0] || requestedSite;
    const range = rangeFor(interval);
    const timezone = "Africa/Lagos";

    const [counts, sessionCount, seriesRows, pages, referrers, countries, regions, browsers, operatingSystems, devices] =
        await Promise.all([
            api.getCounts(siteId, interval, timezone).catch(() => ({ views: 0, visitors: 0, bounces: 0 })),
            api.getSessionCount(siteId, interval, timezone).catch(() => 0),
            api.getViewsGroupedByInterval(siteId, range.type, range.start.toDate(), range.end.toDate(), timezone).catch(() => []),
            api.getCountByPath(siteId, interval, timezone).catch(() => []),
            api.getCountByReferrer(siteId, interval, timezone).catch(() => []),
            api.getCountByCountry(siteId, interval, timezone).catch(() => []),
            api.getCountByRegion(siteId, interval, timezone).catch(() => []),
            api.getCountByBrowser(siteId, interval, timezone).catch(() => []),
            api.getCountByOperatingSystem(siteId, interval, timezone).catch(() => []),
            api.getCountByDeviceType(siteId, interval, timezone).catch(() => []),
        ]);

    const sessions = sessionCount || counts.visitors;
    const bounceRate = sessions > 0 ? Math.max(0, counts.bounces / sessions) * 100 : 0;

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
        },
        series: seriesRows.map(([date, point]) => ({ date: new Date(date), ...point })),
        pages,
        referrers,
        countries,
        regions,
        browsers,
        operatingSystems,
        devices,
    };
}

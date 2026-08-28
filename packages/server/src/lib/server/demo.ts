import type {
    AnalyticsEvent,
    CountRow,
    DashboardData,
    TrafficPoint,
} from "$lib/types";
import { presentFunnel } from "./insights";

function row(label: string, visitors: number, views = visitors): CountRow {
    return [label, visitors, views];
}

function visitor(
    partial: Partial<AnalyticsEvent["visitor"]> = {},
): AnalyticsEvent["visitor"] {
    return {
        id: "vis_demo",
        sessionId: "ses_demo",
        network: "102.89.0.0/24",
        country: "Nigeria",
        region: "Lagos",
        city: "Lagos",
        browser: "Chrome",
        browserVersion: "128",
        operatingSystem: "macOS",
        deviceType: "desktop",
        deviceModel: "",
        userAgent: "Mozilla/5.0",
        hostname: "pulse.example",
        path: "/",
        referrer: "Direct",
        sessionDepth: 3,
        firstSeen: "Current retention window",
        lastSeen: "2 hours ago",
        ...partial,
    };
}

function event(
    index: number,
    partial: Omit<Partial<AnalyticsEvent>, "visitor"> & {
        visitor?: Partial<AnalyticsEvent["visitor"]>;
    },
): AnalyticsEvent {
    const type = partial.type ?? "interaction";
    return {
        id: `SIG-${String(index).padStart(4, "0")}`,
        type,
        label: partial.label ?? "Interaction",
        target: partial.target ?? "/",
        detail: partial.detail ?? "",
        origin: partial.origin ?? "Lagos, Nigeria",
        device: partial.device ?? "Desktop · macOS · Chrome",
        count: partial.count ?? 1,
        change: 0,
        lastSeen: partial.lastSeen ?? "2 hours ago",
        occurredAt: partial.occurredAt ?? new Date().toISOString(),
        visitor: visitor(partial.visitor),
    };
}

function seriesFor(interval: string): TrafficPoint[] {
    const hourly = interval === "today" || interval === "yesterday" || interval === "1d";
    const count = hourly ? 12 : interval === "90d" ? 30 : interval === "30d" ? 30 : interval === "14d" ? 14 : 7;
    const visitors = hourly
        ? [18, 24, 19, 31, 42, 38, 51, 47, 36, 29, 22, 17]
        : [96, 128, 114, 162, 148, 186, 174, 132, 158, 171, 149, 188, 166, 142];
    const previous = hourly
        ? [14, 19, 16, 22, 33, 29, 41, 38, 28, 21, 18, 13]
        : [82, 101, 98, 140, 121, 155, 148, 118, 136, 144, 128, 160, 139, 121];

    return Array.from({ length: count }, (_, index) => {
        const date = new Date();
        if (hourly) date.setHours(date.getHours() - (count - 1 - index), 0, 0, 0);
        else date.setDate(date.getDate() - (count - 1 - index));
        const current = visitors[index % visitors.length] ?? 120;
        const prior = previous[index % previous.length] ?? 100;
        return {
            date,
            visitors: current,
            views: Math.round(current * 1.7),
            previousVisitors: prior,
            previousViews: Math.round(prior * 1.6),
        };
    });
}

export function demoDashboard(input: {
    siteId: string;
    interval: string;
    sites: string[];
}): DashboardData {
    const sites = input.sites.length ? input.sites : ["pulse"];
    const siteId = sites.includes(input.siteId) ? input.siteId : sites[0];
    const series = seriesFor(input.interval);
    const visitors = 2814;
    const views = 4672;
    const sessions = 3039;
    const bounces = 1155;

    return {
        source: "demo",
        siteId,
        sites,
        interval: input.interval,
        generatedAt: new Date().toISOString(),
        stats: {
            views,
            visitors,
            sessions,
            bounces,
            bounceRate: (bounces / sessions) * 100,
            pagesPerVisit: views / sessions,
            previousVisitors: 2376,
        },
        series,
        pages: [
            row("/", 842, 1104),
            row("/docs", 418, 690),
            row("/pricing", 296, 412),
            row("/blog/privacy-first-analytics", 214, 358),
            row("/changelog", 176, 241),
            row("/login", 148, 163),
            row("/blog", 121, 198),
            row("/settings", 94, 140),
        ],
        routes: [
            row("/", 842, 1104),
            row("/docs", 418, 690),
            row("/pricing", 296, 412),
            row("/blog/:id", 214, 358),
            row("/changelog", 176, 241),
        ],
        hostnames: [
            row("pulse.example", 1980, 3201),
            row("docs.pulse.example", 612, 980),
            row("app.pulse.example", 222, 491),
        ],
        referrers: [
            row("Direct", 1104, 1680),
            row("github.com", 486, 722),
            row("x.com", 312, 448),
            row("google.com", 274, 401),
            row("linkedin.com", 188, 260),
            row("newsletter", 142, 198),
        ],
        countries: [
            row("Nigeria", 764),
            row("United States", 512),
            row("United Kingdom", 318),
            row("Germany", 246),
            row("Canada", 188),
            row("Netherlands", 142),
            row("Ghana", 128),
            row("France", 96),
        ],
        regions: [
            row("Lagos", 412),
            row("California", 188),
            row("England", 164),
            row("Berlin", 96),
            row("Ontario", 84),
            row("Greater Accra", 72),
        ],
        browsers: [
            row("Chrome", 1688),
            row("Safari", 642),
            row("Firefox", 274),
            row("Edge", 148),
            row("Samsung Internet", 62),
        ],
        browserVersions: [
            row("Chrome 128", 904),
            row("Chrome 127", 486),
            row("Safari 18", 318),
            row("Firefox 130", 164),
            row("Edge 128", 96),
        ],
        operatingSystems: [
            row("macOS", 1120),
            row("Windows", 864),
            row("iOS", 412),
            row("Android", 286),
            row("Linux", 132),
        ],
        devices: [row("desktop", 1846), row("mobile", 812), row("tablet", 156)],
        events: [
            event(1, {
                type: "copy",
                label: "Copied install snippet",
                target: "/docs",
                detail: 'pnpm add @counterscale/tracker',
                count: 48,
                lastSeen: "14 minutes ago",
                origin: "Lagos, Nigeria",
                visitor: { path: "/docs", city: "Lagos" },
            }),
            event(2, {
                type: "outbound",
                label: "Left for GitHub",
                target: "github.com/Vic-Orlands/Pulse-analytics",
                detail: "https://github.com/Vic-Orlands/Pulse-analytics",
                count: 36,
                lastSeen: "32 minutes ago",
                origin: "Berlin, Germany",
                device: "Desktop · Linux · Firefox",
                visitor: {
                    path: "/",
                    country: "Germany",
                    region: "Berlin",
                    city: "Berlin",
                    operatingSystem: "Linux",
                    browser: "Firefox",
                },
            }),
            event(3, {
                type: "download",
                label: "Downloaded brand kit",
                target: "/brand/pulse-kit.zip",
                detail: "pulse-kit.zip",
                count: 12,
                lastSeen: "1 hour ago",
                origin: "London, United Kingdom",
                visitor: {
                    path: "/brand",
                    country: "United Kingdom",
                    region: "England",
                    city: "London",
                },
            }),
            event(4, {
                type: "screenshot",
                label: "Captured pricing table",
                target: "/pricing",
                count: 9,
                lastSeen: "2 hours ago",
                origin: "San Francisco, United States",
                device: "Mobile · iOS · Safari",
                visitor: {
                    path: "/pricing",
                    country: "United States",
                    region: "California",
                    city: "San Francisco",
                    deviceType: "mobile",
                    operatingSystem: "iOS",
                    browser: "Safari",
                },
            }),
            event(5, {
                type: "interaction",
                label: "Opened install sheet",
                target: "/docs#install",
                count: 64,
                lastSeen: "8 minutes ago",
            }),
            event(6, {
                type: "scrape",
                label: "Automated extraction pattern",
                target: "/docs",
                count: 3,
                lastSeen: "Yesterday",
                origin: "Amsterdam, Netherlands",
                visitor: {
                    path: "/docs",
                    country: "Netherlands",
                    city: "Amsterdam",
                },
            }),
        ],
        live: {
            visitors: 4,
            pages: [row("/", 2), row("/docs", 1), row("/pricing", 1)],
        },
        journeys: [
            { path: "/ → /docs → /pricing", steps: ["/", "/docs", "/pricing"], entry: "/", exit: "/pricing", bounced: false, count: 186 },
            { path: "/ → /blog", steps: ["/", "/blog"], entry: "/", exit: "/blog", bounced: false, count: 94 },
            { path: "/docs", steps: ["/docs"], entry: "/docs", exit: "/docs", bounced: true, count: 71 },
            { path: "/pricing → /login", steps: ["/pricing", "/login"], entry: "/pricing", exit: "/login", bounced: false, count: 48 },
        ],
        entries: [row("/", 1420), row("/docs", 418), row("/pricing", 214), row("/blog", 121)],
        exits: [row("/", 612), row("/docs", 388), row("/pricing", 274), row("/login", 148)],
        utmSources: [row("github", 312), row("newsletter", 188), row("twitter", 142), row("(none)", 96)],
        utmMediums: [row("social", 274), row("email", 188), row("referral", 126), row("(none)", 84)],
        utmCampaigns: [row("launch-week", 214), row("docs-refresh", 142), row("privacy-post", 96)],
        copies: [
            { snippet: "pnpm add @counterscale/tracker", path: "/docs", count: 48 },
            { snippet: "data-site-id=\"your-app\"", path: "/docs", count: 31 },
            { snippet: "npx convex dev", path: "/blog/privacy-first-analytics", count: 12 },
        ],
        outbound: [
            row("github.com/Vic-Orlands/Pulse-analytics", 36),
            row("workers.cloudflare.com", 18),
            row("docs.convex.dev", 9),
        ],
        downloads: [row("pulse-kit.zip", 12), row("tracker.js", 7)],
        funnel: presentFunnel({
            sessions,
            engagedSessions: 1884,
            convertedSessions: 412,
        }),
        bounceByLanding: [row("/", 612, 1420), row("/docs", 188, 418), row("/blog", 64, 121)],
        alerts: [
            {
                id: "scrape",
                severity: "warning",
                title: "Scraping pattern detected",
                detail: "Three automated extraction sessions hit /docs in this window.",
                count: 3,
            },
        ],
        cohorts: { newVisitors: 1690, returningVisitors: 1124 },
        warnings: [
            "Showing sample data. Connect Cloudflare Analytics Engine to see live traffic.",
        ],
    };
}

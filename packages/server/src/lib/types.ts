export type CountRow = [label: string, visitors: number, views?: number];

export type TrafficPoint = {
    date: Date;
    views: number;
    visitors: number;
    previousViews: number;
    previousVisitors: number;
};

export type AnalyticsEvent = {
    id: string;
    type: "screenshot" | "copy" | "scrape" | "interaction";
    label: string;
    target: string;
    count: number;
    change: number;
    lastSeen: string;
    occurredAt: string;
    visitor: {
        id: string;
        sessionId: string;
        network: string;
        country: string;
        region: string;
        city: string;
        browser: string;
        browserVersion: string;
        operatingSystem: string;
        deviceType: string;
        deviceModel: string;
        userAgent: string;
        hostname: string;
        path: string;
        referrer: string;
        sessionDepth: number;
        firstSeen: string;
        lastSeen: string;
    };
};

export type DashboardData = {
    source: "live" | "unavailable";
    siteId: string;
    sites: string[];
    interval: string;
    generatedAt: string;
    stats: {
        views: number;
        visitors: number;
        sessions: number;
        bounces: number;
        bounceRate: number;
        pagesPerVisit: number;
        previousVisitors: number;
    };
    series: TrafficPoint[];
    pages: CountRow[];
    routes: CountRow[];
    hostnames: CountRow[];
    referrers: CountRow[];
    countries: CountRow[];
    regions: CountRow[];
    browsers: CountRow[];
    browserVersions: CountRow[];
    operatingSystems: CountRow[];
    devices: CountRow[];
    events: AnalyticsEvent[];
};

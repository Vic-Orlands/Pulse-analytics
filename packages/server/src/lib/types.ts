export type CountRow = [label: string, visitors: number, views?: number];

export type TrafficPoint = {
    date: Date;
    views: number;
    visitors: number;
    previousViews: number;
    previousVisitors: number;
};

export const ANALYTICS_EVENT_TYPES = [
    "screenshot",
    "copy",
    "scrape",
    "interaction",
    "outbound",
    "download",
] as const;

export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

export type AnalyticsEvent = {
    id: string;
    type: AnalyticsEventType;
    label: string;
    target: string;
    detail: string;
    origin: string;
    device: string;
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

export type InsightJourney = {
    path: string;
    steps: string[];
    entry: string;
    exit: string;
    bounced: boolean;
    count: number;
};

export type LiveSnapshot = {
    visitors: number;
    pages: CountRow[];
};

export type CopySnippet = {
    snippet: string;
    path: string;
    count: number;
};

export type FunnelStep = {
    label: string;
    count: number;
    rate: number;
};

export type AnalyticsAlert = {
    id: string;
    severity: "info" | "warning" | "critical";
    title: string;
    detail: string;
    count: number;
};

export type CohortSplit = {
    newVisitors: number;
    returningVisitors: number;
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
    live: LiveSnapshot;
    journeys: InsightJourney[];
    entries: CountRow[];
    exits: CountRow[];
    utmSources: CountRow[];
    utmMediums: CountRow[];
    utmCampaigns: CountRow[];
    copies: CopySnippet[];
    outbound: CountRow[];
    downloads: CountRow[];
    funnel: FunnelStep[];
    bounceByLanding: CountRow[];
    alerts: AnalyticsAlert[];
    cohorts: CohortSplit;
    warnings: string[];
};

export type CountRow = [label: string, visitors: number, views?: number];

export type TrafficPoint = {
    date: Date;
    views: number;
    visitors: number;
};

export type DashboardData = {
    source: "live" | "preview";
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
    };
    series: TrafficPoint[];
    pages: CountRow[];
    referrers: CountRow[];
    countries: CountRow[];
    regions: CountRow[];
    browsers: CountRow[];
    operatingSystems: CountRow[];
    devices: CountRow[];
};

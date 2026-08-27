import type { AnalyticsAlert, CohortSplit, CopySnippet, CountRow, FunnelStep, InsightJourney, LiveSnapshot } from "$lib/types";
import { formatPathLabel } from "./present";

export type SessionPathRow = {
    sessionId: string;
    path: string;
    firstSeen: string;
    hits: number;
};

export type LiveVisitorRow = {
    sessionId: string;
    path: string;
    country: string;
    lastSeen: string;
};

export type EventValueRow = {
    value: string;
    path: string;
    count: number;
};

export type CohortRow = {
    visitorId: string;
    firstSeen: string;
    lastSeen: string;
};

export type EventTypeCount = {
    eventType: string;
    count: number;
};

function parseAeTime(value: string): Date | null {
    const raw = (value || "").trim();
    if (!raw) return null;
    const normalized = raw.includes("T") ? raw : raw.replace(" ", "T") + (raw.endsWith("Z") ? "" : "Z");
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
}

function compactSteps(paths: string[]): string[] {
    const steps: string[] = [];
    for (const path of paths) {
        const label = formatPathLabel(path);
        if (steps[steps.length - 1] !== label) steps.push(label);
    }
    return steps;
}

export function presentJourneys(rows: SessionPathRow[], limit = 8): InsightJourney[] {
    const bySession = new Map<string, SessionPathRow[]>();
    for (const row of rows) {
        const id = (row.sessionId || "").trim();
        if (!id) continue;
        const current = bySession.get(id) ?? [];
        current.push(row);
        bySession.set(id, current);
    }

    const grouped = new Map<string, InsightJourney>();
    for (const steps of bySession.values()) {
        const ordered = [...steps].sort((a, b) => a.firstSeen.localeCompare(b.firstSeen));
        const pathSteps = compactSteps(ordered.map((step) => step.path));
        if (!pathSteps.length) continue;
        const signature = pathSteps.join(" → ");
        const current = grouped.get(signature);
        if (current) {
            current.count += 1;
            continue;
        }
        grouped.set(signature, {
            path: signature,
            steps: pathSteps,
            entry: pathSteps[0] || "/",
            exit: pathSteps[pathSteps.length - 1] || "/",
            bounced: pathSteps.length <= 1,
            count: 1,
        });
    }

    return Array.from(grouped.values())
        .sort((a, b) => b.count - a.count || a.path.localeCompare(b.path))
        .slice(0, limit);
}

export function presentEntryExit(journeys: InsightJourney[]): {
    entries: CountRow[];
    exits: CountRow[];
    bounceByLanding: CountRow[];
} {
    const entries = new Map<string, [number, number]>();
    const exits = new Map<string, number>();
    const bounce = new Map<string, [number, number]>();

    for (const journey of journeys) {
        const landing = journey.entry;
        const entry = entries.get(landing) ?? [0, 0];
        entries.set(landing, [entry[0] + journey.count, entry[1] + journey.count]);
        exits.set(journey.exit, (exits.get(journey.exit) ?? 0) + journey.count);
        const landingBounce = bounce.get(landing) ?? [0, 0];
        bounce.set(landing, [
            landingBounce[0] + (journey.bounced ? journey.count : 0),
            landingBounce[1] + journey.count,
        ]);
    }

    const toRows = (map: Map<string, number>): CountRow[] =>
        Array.from(map, ([label, count]) => [label, count, count] as CountRow).sort((a, b) => b[1] - a[1]);

    return {
        entries: Array.from(entries, ([label, counts]) => [label, counts[0], counts[1]] as CountRow).sort((a, b) => b[1] - a[1]),
        exits: toRows(exits),
        bounceByLanding: Array.from(bounce, ([label, counts]) => [label, counts[0], counts[1]] as CountRow)
            .sort((a, b) => b[1] - a[1] || b[2]! - a[2]!),
    };
}

export function presentLiveVisitors(rows: LiveVisitorRow[]): LiveSnapshot {
    const latest = new Map<string, LiveVisitorRow>();
    for (const row of rows) {
        const id = (row.sessionId || "").trim();
        if (!id) continue;
        const current = latest.get(id);
        if (!current || row.lastSeen > current.lastSeen) latest.set(id, row);
    }

    const pages = new Map<string, number>();
    for (const visitor of latest.values()) {
        const path = formatPathLabel(visitor.path);
        pages.set(path, (pages.get(path) ?? 0) + 1);
    }

    return {
        visitors: latest.size,
        pages: Array.from(pages, ([label, count]) => [label, count, count] as CountRow).sort((a, b) => b[1] - a[1]),
    };
}

export function presentCopySnippets(rows: EventValueRow[], limit = 8): CopySnippet[] {
    const grouped = new Map<string, CopySnippet>();
    for (const row of rows) {
        const snippet = (row.value || "").replace(/\s+/g, " ").trim();
        if (!snippet) continue;
        const path = formatPathLabel(row.path);
        const key = `${snippet.toLowerCase()}::${path}`;
        const current = grouped.get(key);
        if (current) {
            current.count += Number(row.count) || 0;
            continue;
        }
        grouped.set(key, { snippet, path, count: Number(row.count) || 0 });
    }

    return Array.from(grouped.values())
        .sort((a, b) => b.count - a.count || a.snippet.localeCompare(b.snippet))
        .slice(0, limit);
}

export function presentLinkRows(rows: EventValueRow[], limit = 8): CountRow[] {
    const grouped = new Map<string, number>();
    for (const row of rows) {
        const label = (row.value || row.path || "").trim() || "(unknown)";
        grouped.set(label, (grouped.get(label) ?? 0) + (Number(row.count) || 0));
    }
    return Array.from(grouped, ([label, count]) => [label, count, count] as CountRow)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);
}

export function presentFunnel(input: {
    sessions: number;
    engagedSessions: number;
    convertedSessions: number;
}): FunnelStep[] {
    const sessions = Math.max(0, input.sessions);
    const engaged = Math.min(sessions, Math.max(0, input.engagedSessions));
    const converted = Math.min(engaged, Math.max(0, input.convertedSessions));
    const rate = (count: number) => (sessions > 0 ? (count / sessions) * 100 : 0);

    return [
        { label: "Landed", count: sessions, rate: rate(sessions) },
        { label: "Viewed another page", count: engaged, rate: rate(engaged) },
        { label: "Copied, clicked out, or downloaded", count: converted, rate: rate(converted) },
    ];
}

export function presentCohorts(rows: CohortRow[], start: Date, end: Date): CohortSplit {
    let newVisitors = 0;
    let returningVisitors = 0;

    for (const row of rows) {
        const last = parseAeTime(row.lastSeen);
        if (!last || last < start || last >= end) continue;
        const first = parseAeTime(row.firstSeen);
        if (first && first >= start) newVisitors += 1;
        else returningVisitors += 1;
    }

    return { newVisitors, returningVisitors };
}

export function countEventType(rows: EventTypeCount[], type: string): number {
    return rows
        .filter((row) => row.eventType === type)
        .reduce((sum, row) => sum + (Number(row.count) || 0), 0);
}

const SENSITIVE_PATH = /(\/pricing|\/price|\/docs|\/install|\/api)(\/|$|\?)/i;

export function presentAlerts(input: {
    scrapeCount: number;
    copies: CopySnippet[];
    liveVisitors: number;
    bounceRate: number;
    sessions: number;
}): AnalyticsAlert[] {
    const alerts: AnalyticsAlert[] = [];
    const sensitiveCopies = input.copies.filter((row) => SENSITIVE_PATH.test(row.path));
    const sensitiveCount = sensitiveCopies.reduce((sum, row) => sum + row.count, 0);

    if (input.scrapeCount > 0) {
        alerts.push({
            id: "scrape",
            severity: "warning",
            title: "Scraping detected",
            detail: "Automated extraction patterns were recorded on this property.",
            count: input.scrapeCount,
        });
    }

    if (sensitiveCount > 0) {
        alerts.push({
            id: "copy-sensitive",
            severity: "warning",
            title: "Pricing or docs copied",
            detail: "Copied text originated on pricing, docs, install, or API pages.",
            count: sensitiveCount,
        });
    }

    if (input.liveVisitors >= 20) {
        alerts.push({
            id: "live-spike",
            severity: "info",
            title: "Live traffic spike",
            detail: "A larger than usual number of people are on the site right now.",
            count: input.liveVisitors,
        });
    }

    if (input.sessions >= 20 && input.bounceRate >= 80) {
        alerts.push({
            id: "bounce",
            severity: "info",
            title: "High bounce rate",
            detail: "Most sessions in this window left after a single page.",
            count: Math.round(input.bounceRate),
        });
    }

    return alerts;
}

export function engagedSessionCount(rows: SessionPathRow[]): number {
    const depths = new Map<string, Set<string>>();
    for (const row of rows) {
        const id = (row.sessionId || "").trim();
        if (!id) continue;
        const paths = depths.get(id) ?? new Set<string>();
        paths.add(formatPathLabel(row.path));
        depths.set(id, paths);
    }
    return Array.from(depths.values()).filter((paths) => paths.size >= 2).length;
}

export function uniqueSessionCount(rows: Array<{ sessionId: string }>): number {
    return new Set(rows.map((row) => row.sessionId).filter(Boolean)).size;
}

export function presentSessionInsights(rows: SessionPathRow[], journeyLimit = 8) {
    const journeys = presentJourneys(rows, Number.MAX_SAFE_INTEGER);
    const surfaces = presentEntryExit(journeys);
    return {
        journeys: journeys.slice(0, journeyLimit),
        entries: surfaces.entries.slice(0, 8),
        exits: surfaces.exits.slice(0, 8),
        bounceByLanding: surfaces.bounceByLanding.slice(0, 8),
        engagedSessions: engagedSessionCount(rows),
        sessionsTracked: uniqueSessionCount(rows),
    };
}

export function emptyInsights() {
    return {
        live: { visitors: 0, pages: [] as CountRow[] },
        journeys: [] as InsightJourney[],
        entries: [] as CountRow[],
        exits: [] as CountRow[],
        utmSources: [] as CountRow[],
        utmMediums: [] as CountRow[],
        utmCampaigns: [] as CountRow[],
        copies: [] as CopySnippet[],
        outbound: [] as CountRow[],
        downloads: [] as CountRow[],
        funnel: presentFunnel({ sessions: 0, engagedSessions: 0, convertedSessions: 0 }),
        bounceByLanding: [] as CountRow[],
        alerts: [] as AnalyticsAlert[],
        cohorts: { newVisitors: 0, returningVisitors: 0 } as CohortSplit,
    };
}

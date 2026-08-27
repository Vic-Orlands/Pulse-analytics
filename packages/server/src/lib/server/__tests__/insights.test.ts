import { describe, expect, test } from "vitest";
import {
    presentAlerts,
    presentCohorts,
    presentCopySnippets,
    presentFunnel,
    presentLiveVisitors,
    presentSessionInsights,
} from "../insights";

describe("session insights", () => {
    test("rebuilds ordered journeys and entry/exit pages", () => {
        const insights = presentSessionInsights([
            { sessionId: "a", path: "/", firstSeen: "2026-08-27 10:00:00", hits: 1 },
            { sessionId: "a", path: "/pricing", firstSeen: "2026-08-27 10:01:00", hits: 1 },
            { sessionId: "b", path: "/", firstSeen: "2026-08-27 10:02:00", hits: 1 },
            { sessionId: "c", path: "/", firstSeen: "2026-08-27 10:03:00", hits: 1 },
            { sessionId: "c", path: "/pricing", firstSeen: "2026-08-27 10:04:00", hits: 1 },
        ]);

        expect(insights.journeys[0]).toMatchObject({
            path: "/ → /pricing",
            entry: "/",
            exit: "/pricing",
            bounced: false,
            count: 2,
        });
        expect(insights.entries[0]).toEqual(["/", 3, 3]);
        expect(insights.exits[0]).toEqual(["/pricing", 2, 2]);
        expect(insights.bounceByLanding[0]).toEqual(["/", 1, 3]);
        expect(insights.engagedSessions).toBe(2);
    });
});

describe("live visitors", () => {
    test("counts unique sessions and their latest page", () => {
        const live = presentLiveVisitors([
            { sessionId: "a", path: "/", country: "NG", lastSeen: "2026-08-27 12:00:00" },
            { sessionId: "a", path: "/docs", country: "NG", lastSeen: "2026-08-27 12:01:00" },
            { sessionId: "b", path: "/docs", country: "US", lastSeen: "2026-08-27 12:01:30" },
        ]);

        expect(live.visitors).toBe(2);
        expect(live.pages[0]).toEqual(["/docs", 2, 2]);
    });
});

describe("copy and funnel insights", () => {
    test("groups copied snippets by page", () => {
        const copies = presentCopySnippets([
            { value: "pnpm add pulse", path: "/docs/install", count: 2 },
            { value: "pnpm add pulse", path: "/docs/install", count: 1 },
        ]);
        expect(copies[0]).toEqual({ snippet: "pnpm add pulse", path: "/docs/install", count: 3 });
    });

    test("computes conversion rates from landed sessions", () => {
        const funnel = presentFunnel({ sessions: 10, engagedSessions: 4, convertedSessions: 2 });
        expect(funnel.map((step) => step.rate)).toEqual([100, 40, 20]);
    });

    test("flags copies from pricing and scraping", () => {
        const alerts = presentAlerts({
            scrapeCount: 3,
            copies: [{ snippet: "$29", path: "/pricing", count: 4 }],
            liveVisitors: 2,
            bounceRate: 20,
            sessions: 10,
        });
        expect(alerts.map((alert) => alert.id)).toEqual(["scrape", "copy-sensitive"]);
    });
});

describe("new vs returning", () => {
    test("classifies visitors by first seen versus the selected window", () => {
        const start = new Date("2026-08-20T00:00:00.000Z");
        const end = new Date("2026-08-27T00:00:00.000Z");
        const cohorts = presentCohorts(
            [
                { visitorId: "new", firstSeen: "2026-08-21 00:00:00", lastSeen: "2026-08-22 00:00:00" },
                { visitorId: "old", firstSeen: "2026-08-01 00:00:00", lastSeen: "2026-08-22 00:00:00" },
                { visitorId: "outside", firstSeen: "2026-08-01 00:00:00", lastSeen: "2026-08-10 00:00:00" },
            ],
            start,
            end,
        );
        expect(cohorts).toEqual({ newVisitors: 1, returningVisitors: 1 });
    });
});

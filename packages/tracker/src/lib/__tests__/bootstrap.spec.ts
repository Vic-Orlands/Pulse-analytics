import { describe, expect, test } from "vitest";
import { collectUrlFromTrackerSrc, resolveSiteId } from "../bootstrap";

describe("resolveSiteId", () => {
    test("prefers an explicit site id", () => {
        expect(resolveSiteId(" portfolio ", "www.example.com")).toBe("portfolio");
    });

    test("falls back to hostname without www", () => {
        expect(resolveSiteId("", "www.sleeksign.com")).toBe("sleeksign.com");
        expect(resolveSiteId(null, "pulseguard.dev")).toBe("pulseguard.dev");
    });

    test("uses unknown when nothing is available", () => {
        expect(resolveSiteId("   ", "")).toBe("unknown");
    });
});

describe("collectUrlFromTrackerSrc", () => {
    test("maps tracker.js to collect and drops cache-busting queries", () => {
        expect(
            collectUrlFromTrackerSrc(
                "https://pulse-analytics.example.workers.dev/tracker.js?v=3.5.0",
            ),
        ).toBe("https://pulse-analytics.example.workers.dev/collect");
    });

    test("resolves relative tracker URLs", () => {
        expect(collectUrlFromTrackerSrc("/tracker.js?v=3.5.0", "https://pulse.example/app")).toBe(
            "https://pulse.example/collect",
        );
    });
});

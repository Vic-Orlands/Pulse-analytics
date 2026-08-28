import { describe, expect, test } from "vitest";
import { isPublicPath, safeLoginRedirect } from "../publicPaths";

describe("isPublicPath", () => {
    test("allows the homepage and owner login", () => {
        expect(isPublicPath("/")).toBe(true);
        expect(isPublicPath("/login")).toBe(true);
        expect(isPublicPath("/login/")).toBe(true);
    });

    test("keeps the dashboard and ledger private", () => {
        expect(isPublicPath("/dashboard")).toBe(false);
        expect(isPublicPath("/signals")).toBe(false);
        expect(isPublicPath("/settings")).toBe(false);
    });

    test("allows tracker and preview assets", () => {
        expect(isPublicPath("/tracker.js")).toBe(true);
        expect(isPublicPath("/pulse-preview.mp4")).toBe(true);
        expect(isPublicPath("/favicon.svg")).toBe(true);
        expect(isPublicPath("/collect")).toBe(true);
    });
});

describe("safeLoginRedirect", () => {
    test("sends owners to the dashboard by default", () => {
        expect(safeLoginRedirect(null)).toBe("/dashboard");
        expect(safeLoginRedirect("/dashboard?site=pulse")).toBe("/dashboard?site=pulse");
        expect(safeLoginRedirect("/signals")).toBe("/signals");
    });

    test("rejects unsafe next values", () => {
        expect(safeLoginRedirect("https://example.com")).toBe("/dashboard");
        expect(safeLoginRedirect("//evil.example")).toBe("/dashboard");
        expect(safeLoginRedirect("/login")).toBe("/dashboard");
    });
});

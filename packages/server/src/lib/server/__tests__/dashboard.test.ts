import { afterEach, describe, expect, test, vi } from "vitest";
import { clearDashboardCaches, getDashboardData } from "../dashboard";

describe("dashboard app discovery", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        clearDashboardCaches();
    });

    test("keeps configured apps visible when automatic discovery fails", async () => {
        const fetch = vi
            .fn<typeof globalThis.fetch>()
            .mockResolvedValueOnce(new Response("forbidden", { status: 403, statusText: "Forbidden" }))
			.mockImplementation(
				async () => new Response(JSON.stringify({ data: [] }), { status: 200 })
			);
        vi.stubGlobal("fetch", fetch);

        const data = await getDashboardData(new URL("https://pulse.mezie.dev/"), {
            CF_ACCOUNT_ID: "account",
            CF_BEARER_TOKEN: "token",
            PUBLIC_SITE_IDS: "pulse, sleeksign, portfolio, pulseguard, silo, ethos",
        } as App.Platform["env"]);

        expect(data.siteId).toBe("pulse");
        expect(data.sites).toEqual(["pulse", "sleeksign", "portfolio", "pulseguard", "silo", "ethos"]);
        expect(data.warnings.some((warning) => /^apps:/i.test(warning))).toBe(true);
    });

    test("hides install-test and probe apps", async () => {
        const payload = {
            data: [
                { siteId: "pulse", count: 40 },
                { siteId: "install-test", count: 12 },
                { siteId: "probe", count: 8 },
                { siteId: "sleeksign", count: 5 },
            ],
        };
        const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(
            async () => new Response(JSON.stringify(payload), { status: 200 }),
        );
        vi.stubGlobal("fetch", fetch);

        const data = await getDashboardData(new URL("https://pulse.mezie.dev/"), {
            CF_ACCOUNT_ID: "account",
            CF_BEARER_TOKEN: "token",
            PUBLIC_SITE_IDS: "pulse,install-test,probe,sleeksign",
        } as App.Platform["env"]);

        expect(data.sites).toEqual(["pulse", "sleeksign"]);
        expect(data.sites).not.toContain("install-test");
        expect(data.sites).not.toContain("probe");
    });

    test("renders an unavailable dashboard instead of throwing when analytics queries fail", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(
            async () =>
                new Response(JSON.stringify({ error: "limit exceeded" }), {
                    status: 400,
                    statusText: "Bad Request",
                }),
        );
        vi.stubGlobal("fetch", fetch);

        const data = await getDashboardData(new URL("https://pulse.mezie.dev/"), {
            CF_ACCOUNT_ID: "account",
            CF_BEARER_TOKEN: "token",
            PUBLIC_SITE_IDS: "pulse",
        } as App.Platform["env"]);

        expect(data.siteId).toBe("pulse");
        expect(data.source).toBe("live");
        expect(data.stats.views).toBe(0);
        expect(data.warnings.length).toBeGreaterThan(0);
        expect(data.warnings.join(" ")).toMatch(/limit exceeded|too many requests/i);
    });

    test("loads sample data in development when Cloudflare is not configured", async () => {
        const data = await getDashboardData(new URL("https://pulse.mezie.dev/?site=pulse&interval=7d"), {
            PUBLIC_SITE_IDS: "pulse,sleeksign",
        } as App.Platform["env"]);

        expect(data.source).toBe("demo");
        expect(data.siteId).toBe("pulse");
        expect(data.sites).toEqual(["pulse", "sleeksign"]);
        expect(data.stats.visitors).toBeGreaterThan(0);
        expect(data.series.length).toBeGreaterThan(0);
        expect(data.warnings[0]).toMatch(/sample/i);
    });
});

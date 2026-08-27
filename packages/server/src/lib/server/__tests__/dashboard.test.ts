import { afterEach, describe, expect, test, vi } from "vitest";
import { getDashboardData } from "../dashboard";

describe("dashboard app discovery", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
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
        expect(data.warnings.some((warning) => /^app discovery:/i.test(warning))).toBe(true);
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
});

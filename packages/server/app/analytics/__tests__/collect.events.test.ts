import { describe, expect, test, vi } from "vitest";
import type { AnalyticsEngineDataset } from "@cloudflare/workers-types";
import { collectRequestHandler } from "../collect";

function requestWith(search: Record<string, string>, headers: Record<string, string> = {}) {
    return {
        method: "GET",
        url: "https://example.com/collect?" + new URLSearchParams(search).toString(),
        headers: {
            get: (header: string) => headers[header] || headers[header.toLowerCase()] || null,
        },
    };
}

describe("collectRequestHandler events", () => {
    test("writes classified events to the events dataset with copied text", () => {
        const env = {
            WEB_COUNTER_AE: { writeDataPoint: vi.fn() } as AnalyticsEngineDataset,
            WEB_EVENTS_AE: { writeDataPoint: vi.fn() } as AnalyticsEngineDataset,
        } as Env;

        collectRequestHandler(
            requestWith({
                sid: "example",
                h: "example.com",
                p: "/docs/install",
                r: "",
                ev: "1",
                et: "copy",
                en: "Content copied",
                tg: "/docs/install · pre",
                val: "pnpm add @counterscale/tracker",
            }) as unknown as Request,
            env,
            { country: "NG", region: "Lagos", city: "Ikeja", network: "102.89.23.14" },
        );

        expect(env.WEB_COUNTER_AE.writeDataPoint).not.toHaveBeenCalled();
        expect(env.WEB_EVENTS_AE.writeDataPoint).toHaveBeenCalled();
        const datapoint = (env.WEB_EVENTS_AE.writeDataPoint as ReturnType<typeof vi.fn>).mock.calls[0][0];
        expect(datapoint.blobs[10]).toBe("copy");
        expect(datapoint.blobs[12]).toBe("/docs/install · pre");
        expect(datapoint.blobs[13]).toBe("pnpm add @counterscale/tracker");
        expect(datapoint.blobs[15]).toBe("Lagos");
        expect(datapoint.blobs[16]).toBe("Ikeja");
    });

    test("does not record events as pageviews when the events dataset is missing", () => {
        const env = {
            WEB_COUNTER_AE: { writeDataPoint: vi.fn() } as AnalyticsEngineDataset,
        } as Env;

        collectRequestHandler(
            requestWith({
                sid: "example",
                h: "example.com",
                p: "/docs/install",
                ev: "1",
                et: "copy",
                en: "Content copied",
                val: "secret snippet",
            }) as unknown as Request,
            env,
        );

        expect(env.WEB_COUNTER_AE.writeDataPoint).not.toHaveBeenCalled();
    });
});

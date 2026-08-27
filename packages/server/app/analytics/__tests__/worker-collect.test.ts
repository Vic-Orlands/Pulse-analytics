import { describe, expect, test, vi } from "vitest";
import type { AnalyticsEngineDataset } from "@cloudflare/workers-types";
import { handleCollect, requestFromCollect } from "../worker-collect";

describe("worker collect adapter", () => {
    test("merges POST bodies into collect query params", async () => {
        const request = new Request("https://pulse.example/collect", {
            method: "POST",
            headers: { "content-type": "text/plain" },
            body: "sid=example&ev=1&et=copy&val=pnpm+add+pulse&p=%2Fdocs",
        });

        const collectRequest = await requestFromCollect(request);
        const url = new URL(collectRequest.url);
        expect(url.searchParams.get("sid")).toBe("example");
        expect(url.searchParams.get("ev")).toBe("1");
        expect(url.searchParams.get("et")).toBe("copy");
        expect(url.searchParams.get("val")).toBe("pnpm add pulse");
        expect(url.searchParams.get("p")).toBe("/docs");
    });

    test("writes copy events from POST onto WEB_EVENTS_AE using Cloudflare extras", async () => {
        const env = {
            WEB_COUNTER_AE: { writeDataPoint: vi.fn() } as AnalyticsEngineDataset,
            WEB_EVENTS_AE: { writeDataPoint: vi.fn() } as AnalyticsEngineDataset,
        };

        const request = new Request("https://pulse.example/collect", {
            method: "POST",
            headers: { "content-type": "text/plain" },
            body: "sid=example&h=example.com&p=/docs&ev=1&et=copy&en=Content%20copied&val=hello%20world",
        });
        Object.defineProperty(request, "cf", {
            value: { country: "NG", region: "Lagos", city: "Ikeja" },
        });

        const response = await handleCollect(request, env);
        expect(response.status).toBe(200);
        expect(env.WEB_COUNTER_AE.writeDataPoint).not.toHaveBeenCalled();
        expect(env.WEB_EVENTS_AE.writeDataPoint).toHaveBeenCalled();
        const datapoint = (env.WEB_EVENTS_AE.writeDataPoint as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
            blobs: string[];
        };
        expect(datapoint.blobs[10]).toBe("copy");
        expect(datapoint.blobs[13]).toBe("hello world");
        expect(datapoint.blobs[15]).toBe("Lagos");
    });
});

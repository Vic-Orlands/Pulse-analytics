import { afterEach, describe, expect, test, vi } from "vitest";
import { makeRequest } from "../request";

describe("makeRequest", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    test("sends classified events with sendBeacon so copies survive navigation", () => {
        const sendBeacon = vi.fn<(url: string, data?: BodyInit | null) => boolean>(() => true);
        vi.stubGlobal("navigator", { sendBeacon });

        makeRequest("https://pulse.example/collect", {
            sid: "example",
            h: "example.com",
            p: "/docs",
            r: "",
            ev: "1",
            et: "copy",
            val: "copied text",
        });

        expect(sendBeacon).toHaveBeenCalledTimes(1);
        const [url, body] = sendBeacon.mock.calls[0];
        expect(url).toBe("https://pulse.example/collect");
        expect(body).toBeInstanceOf(Blob);
    });
});

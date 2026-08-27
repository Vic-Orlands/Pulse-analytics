import { describe, expect, test } from "vitest";
import {
    deviceLabel,
    eventHeadline,
    formatHostLabel,
    formatPathLabel,
    formatReferrerLabel,
    originLabel,
    presentCountRows,
    presentEvents,
} from "../present";

describe("surface labels", () => {
    test("formats empty referrers as Direct and groups hostnames", () => {
        const rows = presentCountRows(
            [
                ["", 12, 20],
                ["https://www.google.com/search?q=pulse", 8, 11],
                ["https://google.com/", 4, 5],
                ["newsletter", 3, 3],
            ],
            formatReferrerLabel,
        );

        expect(rows[0]).toEqual(["Direct", 12, 20]);
        expect(rows[1]).toEqual(["google.com", 12, 16]);
        expect(rows[2]).toEqual(["newsletter", 3, 3]);
    });

    test("keeps readable page paths and hostnames", () => {
        expect(formatPathLabel("")).toBe("/");
        expect(formatPathLabel("docs/install")).toBe("/docs/install");
        expect(formatHostLabel("https://www.pulse.dev")).toBe("pulse.dev");
    });
});

describe("signal presentation", () => {
    test("explains copy events with payload, origin, and device", () => {
        const [event] = presentEvents([
            {
                eventType: "copy",
                eventName: "Content copied",
                target: "/docs/install · pre",
                value: "pnpm add @counterscale/tracker",
                path: "/docs/install",
                country: "NG",
                region: "Lagos",
                city: "Ikeja",
                deviceType: "desktop",
                operatingSystem: "macOS",
                browser: "Chrome",
                count: 2,
                lastSeen: "2026-08-26T10:15:00.000Z",
            },
        ]);

        expect(event.label).toBe("Copied “pnpm add @counterscale/tracker”");
        expect(event.detail).toBe("pnpm add @counterscale/tracker");
        expect(event.origin).toBe("Ikeja, Lagos, Nigeria");
        expect(event.device).toBe("Desktop · macOS · Chrome");
        expect(event.visitor.path).toBe("/docs/install");
    });

    test("builds origin and device fallbacks", () => {
        expect(originLabel("US", "California", "San Francisco")).toBe("San Francisco, California, United States");
        expect(deviceLabel("mobile", "iOS", "")).toBe("Mobile · iOS");
        expect(eventHeadline("copy", "Content copied", "")).toBe("Content copied");
    });
});

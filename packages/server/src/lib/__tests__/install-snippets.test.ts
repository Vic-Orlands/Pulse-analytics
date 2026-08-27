import { describe, expect, test } from "vitest";
import { SAMPLE_SITE_ID, TRACKER_VERSION, frameworkGuides, htmlSnippet } from "../install-snippets";

describe("install snippets", () => {
    const origin = "https://pulse-analytics.example.workers.dev";

    test("builds a generic sample snippet, not a list of existing apps", () => {
        const snippet = htmlSnippet(origin);

        expect(snippet).toContain(`data-site-id="${SAMPLE_SITE_ID}"`);
        expect(snippet).toContain(`src="${origin}/tracker.js?v=${TRACKER_VERSION}"`);
        expect(snippet).not.toMatch(/data-site-id="(sleeksign|pulse)"/);
    });

    test("explains where to add the snippet for major frameworks", () => {
        const guides = frameworkGuides(origin);
        const ids = guides.map((guide) => guide.id);

        expect(ids).toEqual(["html", "nextjs", "react", "sveltekit", "solid", "vue", "astro"]);
        expect(guides.find((guide) => guide.id === "nextjs")?.file).toBe("app/layout.tsx");
        expect(guides.find((guide) => guide.id === "sveltekit")?.file).toBe("src/app.html");
        expect(guides.find((guide) => guide.id === "nextjs")?.code).toContain("next/script");
        expect(guides.find((guide) => guide.id === "nextjs")?.code).toContain(`data-site-id="${SAMPLE_SITE_ID}"`);
    });
});

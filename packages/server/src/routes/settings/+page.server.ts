import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ platform }) => ({
    sites: (platform?.env?.PUBLIC_SITE_IDS || "portfolio,sleeksign,pulse")
        .split(",")
        .map((site) => site.trim())
        .filter(Boolean),
});

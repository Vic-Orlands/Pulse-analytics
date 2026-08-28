import type { PageServerLoad } from "./$types";
import { getDashboardData } from "$lib/server/dashboard";

export const load: PageServerLoad = async ({ url, platform }) => {
    return getDashboardData(url, platform?.env);
};

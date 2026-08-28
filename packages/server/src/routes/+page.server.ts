import type { PageServerLoad } from "./$types";
import { digest } from "../hooks.server";

export const load: PageServerLoad = async ({ cookies, platform }) => {
    const password = platform?.env?.DASHBOARD_PASSWORD;
    if (!password) {
        return { signedIn: false };
    }

    const expected = await digest(`pulse:${password}`);
    return { signedIn: cookies.get("pulse_auth") === expected };
};

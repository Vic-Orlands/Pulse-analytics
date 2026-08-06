import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { digest } from "../../hooks.server";

export const load: PageServerLoad = async ({ platform }) => {
    if (!platform?.env?.DASHBOARD_PASSWORD) throw redirect(303, "/");
    return {};
};

export const actions: Actions = {
    default: async ({ request, platform, cookies, url }) => {
        const form = await request.formData();
        const password = String(form.get("password") || "");
        const expectedPassword = platform?.env?.DASHBOARD_PASSWORD;
        if (!expectedPassword || password !== expectedPassword) {
            return fail(400, { invalid: true });
        }

        cookies.set("pulse_auth", await digest(`pulse:${expectedPassword}`), {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
            maxAge: 60 * 60 * 24 * 30,
        });
        throw redirect(303, url.searchParams.get("next") || "/");
    },
};

import type { Handle } from "@sveltejs/kit";
import { isPublicPath } from "$lib/server/publicPaths";

async function digest(value: string) {
    const bytes = new TextEncoder().encode(value);
    const hash = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export const handle: Handle = async ({ event, resolve }) => {
    const password = event.platform?.env?.DASHBOARD_PASSWORD;
    if (!password || isPublicPath(event.url.pathname)) {
        return resolve(event);
    }

    const expected = await digest(`pulse:${password}`);
    if (event.cookies.get("pulse_auth") !== expected) {
        return new Response(null, {
            status: 303,
            headers: { location: `/login?next=${encodeURIComponent(event.url.pathname + event.url.search)}` },
        });
    }

    const response = await resolve(event);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
};

export { digest };

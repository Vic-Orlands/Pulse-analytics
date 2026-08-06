import type { RequestHandler } from "./$types";
import { collectRequestHandler } from "~/analytics/collect";

export const GET: RequestHandler = async ({ request, platform }) => {
    if (!platform?.env?.WEB_COUNTER_AE) {
        return new Response("Analytics binding unavailable", { status: 503 });
    }

    return collectRequestHandler(request, platform.env, {
        country: typeof platform.cf?.country === "string" ? platform.cf.country : "",
        region: typeof platform.cf?.region === "string" ? platform.cf.region : "",
        city: typeof platform.cf?.city === "string" ? platform.cf.city : "",
        network: request.headers.get("cf-connecting-ip") || "",
    });
};

export const OPTIONS: RequestHandler = async () => {
    return new Response(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
};

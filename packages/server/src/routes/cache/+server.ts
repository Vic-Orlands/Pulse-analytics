import type { RequestHandler } from "./$types";
import { handleCacheHeaders } from "~/analytics/collect";

export const GET: RequestHandler = async ({ request }) => {
    const { hits, nextLastModifiedDate } = handleCacheHeaders(request.headers.get("if-modified-since"));
    return new Response(JSON.stringify({ ht: hits }), {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
            "Last-Modified": nextLastModifiedDate.toUTCString(),
            Expires: "Mon, 01 Jan 1990 00:00:00 GMT",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Tk: "N",
        },
    });
};

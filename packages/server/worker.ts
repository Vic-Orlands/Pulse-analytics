import type { ExportedHandler } from "@cloudflare/workers-types";
import app from "./.svelte-kit/cloudflare/_worker.js";
import { handleCollect } from "./app/analytics/worker-collect";
import { extractAsArrow } from "./workers/lib/arrow";
import { handleCacheHeaders } from "./app/analytics/collect";

export default {
    async fetch(request, env, ctx) {
        try {
            const url = new URL(request.url);
            const pathname = url.pathname;

            if (pathname === "/collect") {
                return handleCollect(request, env);
            }

            if (pathname === "/cache" && request.method === "GET") {
                const { hits, nextLastModifiedDate } = handleCacheHeaders(
                    request.headers.get("if-modified-since"),
                );
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
            }

            if (
                request.method === "GET" &&
                (pathname === "/" ||
                    pathname.startsWith("/settings") ||
                    pathname.startsWith("/signals"))
            ) {
                const headers = new Headers(request.headers);
                headers.set("Cache-Control", "no-cache");
                request = new Request(request, { headers });
            }
            return await app.fetch(request, env, ctx);
        } catch (error) {
            console.error("Pulse worker fetch failed", error);
            return new Response("Pulse failed to render this page.", {
                status: 500,
                headers: { "content-type": "text/plain;charset=UTF-8" },
            });
        }
    },
    scheduled(_controller, env, ctx) {
        if (env.CF_STORAGE_ENABLED === "false") return;
        ctx.waitUntil(
            extractAsArrow(
                {
                    accountId: env.CF_ACCOUNT_ID,
                    bearerToken: env.CF_BEARER_TOKEN,
                },
                env.DAILY_ROLLUPS,
            ),
        );
    },
} satisfies ExportedHandler<Env>;

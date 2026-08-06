import type { ExportedHandler } from "@cloudflare/workers-types";
import app from "./.svelte-kit/cloudflare/_worker.js";
import { extractAsArrow } from "./workers/lib/arrow";

export default {
    fetch(request, env, ctx) {
        const pathname = new URL(request.url).pathname;
        if (request.method === "GET" && (pathname === "/" || pathname.startsWith("/settings"))) {
            const headers = new Headers(request.headers);
            headers.set("Cache-Control", "no-cache");
            request = new Request(request, { headers });
        }
        return app.fetch(request, env, ctx);
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

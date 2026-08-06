import type { ExportedHandler } from "@cloudflare/workers-types";
import app from "./.svelte-kit/cloudflare/_worker.js";
import { extractAsArrow } from "./workers/lib/arrow";

export default {
    fetch: app.fetch,
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

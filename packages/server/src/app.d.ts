import type { AnalyticsEngineDataset, R2Bucket } from "@cloudflare/workers-types";

declare global {
    namespace App {
        interface Platform {
            env: {
                WEB_COUNTER_AE: AnalyticsEngineDataset;
                DAILY_ROLLUPS: R2Bucket;
                CF_ACCOUNT_ID?: string;
                CF_BEARER_TOKEN?: string;
                DASHBOARD_PASSWORD?: string;
                PUBLIC_APP_NAME?: string;
                PUBLIC_SITE_IDS?: string;
            };
            context: ExecutionContext;
            caches: CacheStorage;
            cf?: IncomingRequestCfProperties;
        }
    }
}

export {};

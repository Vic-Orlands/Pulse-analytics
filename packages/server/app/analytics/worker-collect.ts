import type { AnalyticsEngineDataset } from "@cloudflare/workers-types";
import { collectRequestHandler } from "./collect";

export type CollectEnv = {
    WEB_COUNTER_AE?: AnalyticsEngineDataset;
    WEB_EVENTS_AE?: AnalyticsEngineDataset;
};

type CloudflareRequest = Request & {
    cf?: {
        country?: unknown;
        region?: unknown;
        regionCode?: unknown;
        city?: unknown;
    };
};

function stringCf(value: unknown): string {
    return typeof value === "string" ? value : "";
}

export function cloudflareCollectExtra(request: Request): Record<string, string> {
    const cf = (request as CloudflareRequest).cf;
    return {
        country: stringCf(cf?.country),
        region: stringCf(cf?.region) || stringCf(cf?.regionCode),
        city: stringCf(cf?.city),
        network: request.headers.get("cf-connecting-ip") || "",
    };
}

export function collectCorsHeaders(): HeadersInit {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };
}

export async function requestFromCollect(request: Request): Promise<Request> {
    if (request.method !== "POST") {
        return request;
    }

    const text = await request.text();
    const url = new URL(request.url);
    if (!text) {
        return new Request(url, { method: "GET", headers: request.headers });
    }

    const trimmed = text.trim();
    if (trimmed.startsWith("{")) {
        try {
            const payload = JSON.parse(trimmed) as Record<string, unknown>;
            for (const [key, value] of Object.entries(payload)) {
                if (typeof value === "string") {
                    url.searchParams.set(key, value);
                }
            }
        } catch {
            new URLSearchParams(trimmed).forEach((value, key) => url.searchParams.set(key, value));
        }
    } else {
        new URLSearchParams(trimmed).forEach((value, key) => url.searchParams.set(key, value));
    }

    return new Request(url, { method: "GET", headers: request.headers });
}

export async function handleCollect(request: Request, env: CollectEnv): Promise<Response> {
    if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: collectCorsHeaders() });
    }

    if (request.method !== "GET" && request.method !== "POST") {
        return new Response("Method not allowed", { status: 405, headers: collectCorsHeaders() });
    }

    const collectRequest = await requestFromCollect(request);
    return collectRequestHandler(collectRequest, env, cloudflareCollectExtra(request));
}

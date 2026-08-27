import type { Client } from "./client";
import { instrumentHistoryBuiltIns } from "./instrument";
import { makeRequest, checkCacheStatus } from "./request";
import {
    getHostnameAndPath,
    getReferrer,
    getUtmParamsFromBrowserUrl,
    isLocalhostAddress,
} from "../shared/utils";
import { getTrackingIdentity } from "./identity";
import { buildCollectRequestParams } from "../shared/request";

export type TrackPageviewOpts = {
    url?: string;
    referrer?: string;
};

export const TRACK_EVENT_TYPES = [
    "screenshot",
    "copy",
    "scrape",
    "interaction",
    "outbound",
    "download",
] as const;

export type TrackEventType = (typeof TRACK_EVENT_TYPES)[number];

export type TrackEventOpts = {
    type: TrackEventType;
    name: string;
    target?: string;
    value?: string;
};

const DOWNLOAD_EXTENSION =
    /\.(pdf|zip|gz|tgz|rar|7z|csv|xlsx?|docx?|pptx?|mp4|mp3|wav|mov|dmg|exe|apk|iso)(\?|#|$)/i;

function isTrackEventType(value: string | undefined): value is TrackEventType {
    return TRACK_EVENT_TYPES.includes(value as TrackEventType);
}

function clickedAnchor(event: Event): HTMLAnchorElement | null {
    const element = event.target instanceof Element ? event.target.closest("a") : null;
    return element instanceof HTMLAnchorElement ? element : null;
}

function classifyLink(anchor: HTMLAnchorElement): { type: "download" | "outbound"; href: string } | null {
    const raw = anchor.getAttribute("href") || "";
    if (!raw || /^(javascript:|#|mailto:|tel:)/i.test(raw.trim())) return null;

    let href = raw;
    try {
        href = new URL(raw, window.location.href).href;
    } catch {
        href = raw;
    }

    if (anchor.hasAttribute("download") || DOWNLOAD_EXTENSION.test(raw) || DOWNLOAD_EXTENSION.test(href)) {
        return { type: "download", href };
    }

    try {
        const url = new URL(href);
        if (
            url.origin !== window.location.origin &&
            (url.protocol === "http:" || url.protocol === "https:")
        ) {
            return { type: "outbound", href: url.href };
        }
    } catch {
        return null;
    }

    return null;
}

function currentContext() {
    const location = window.location;
    return {
        hostname: location.hostname,
        path: location.pathname + location.search || "/",
        referrer: getBrowserReferrer(location.hostname, ""),
    };
}

export function trackEvent(client: Client, opts: TrackEventOpts) {
    if (!client.reportOnLocalhost && isLocalhostAddress(window.location.hostname)) return;
    const context = currentContext();
    const identity = getTrackingIdentity(client.siteId, false);
    const params = buildCollectRequestParams(client.siteId, context.hostname, context.path, context.referrer, {}, undefined, identity);
    params.ev = "1";
    params.et = opts.type;
    params.en = opts.name.slice(0, 120);
    params.tg = (opts.target || context.path).slice(0, 240);
    if (opts.value) params.val = opts.value.slice(0, 400);
    makeRequest(client.reporterUrl, params);
}

function isSensitiveCopyTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false;
    const field = target.closest("input");
    if (!(field instanceof HTMLInputElement)) return false;
    return ["password", "email", "tel", "hidden"].includes(field.type);
}

function copiedPayload(event: ClipboardEvent): string {
    const selected = typeof window.getSelection === "function" ? window.getSelection()?.toString() || "" : "";
    const fromClipboard = event.clipboardData?.getData("text/plain") || event.clipboardData?.getData("text") || "";
    const target = event.target;
    let fromField = "";
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        const start = target.selectionStart ?? 0;
        const end = target.selectionEnd ?? 0;
        if (end > start) fromField = target.value.slice(start, end);
    }
    return (fromClipboard || selected || fromField).replace(/\s+/g, " ").trim().slice(0, 400);
}

function describeCopyTarget(target: EventTarget | null): string {
    const page = window.location.pathname || "/";
    if (!(target instanceof Element)) return page;
    const tagged = target.closest<HTMLElement>("[data-counterscale-event-target], [data-counterscale-event-name]");
    if (tagged?.dataset.counterscaleEventTarget) return tagged.dataset.counterscaleEventTarget;
    const hint = target.closest("pre, code, h1, h2, h3, h4, blockquote, figcaption, li, p, a, td, th");
    const tag = hint?.tagName.toLowerCase();
    const id = hint instanceof HTMLElement && hint.id ? `#${hint.id}` : "";
    const named = tagged?.dataset.counterscaleEventName;
    const surface = [tag, id].filter(Boolean).join("") || named;
    return surface ? `${page} · ${surface}` : page;
}

export function autoTrackEvents(client: Client) {
    const onCopy = (event: ClipboardEvent) => {
        if (isSensitiveCopyTarget(event.target)) return;
        const value = copiedPayload(event);
        const element = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-counterscale-event-name], code, pre") : null;
        trackEvent(client, {
            type: "copy",
            name: element?.dataset.counterscaleEventName || "Content copied",
            target: describeCopyTarget(event.target),
            value: value || undefined,
        });
    };
    const onClick = (event: MouseEvent) => {
        const element = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-counterscale-event]") : null;
        if (element) {
            const type = element.dataset.counterscaleEvent;
            if (!isTrackEventType(type)) return;
            trackEvent(client, {
                type,
                name: element.dataset.counterscaleEventName || element.textContent?.trim() || "Interaction",
                target: element.dataset.counterscaleEventTarget || window.location.pathname,
                value: element.dataset.counterscaleEventValue,
            });
            return;
        }

        const anchor = clickedAnchor(event);
        if (!anchor) return;
        const classified = classifyLink(anchor);
        if (!classified) return;
        trackEvent(client, {
            type: classified.type,
            name: classified.type === "download" ? "File download" : "Outbound click",
            target: window.location.pathname || "/",
            value: classified.href,
        });
    };
    const onKeyUp = (event: KeyboardEvent) => {
        if (event.key !== "PrintScreen") return;
        trackEvent(client, { type: "screenshot", name: "Screenshot captured", target: window.location.pathname || "/" });
    };
    document.addEventListener("copy", onCopy);
    document.addEventListener("click", onClick);
    document.addEventListener("keyup", onKeyUp);
    return () => {
        document.removeEventListener("copy", onCopy);
        document.removeEventListener("click", onClick);
        document.removeEventListener("keyup", onKeyUp);
    };
}

export function autoTrackPageviews(client: Client) {
    const cleanupFn = instrumentHistoryBuiltIns(() => {
        void trackPageview(client);
    });

    void trackPageview(client);

    return cleanupFn;
}

function getCanonicalUrl() {
    const canonical = document.querySelector(
        'link[rel="canonical"][href]',
    ) as HTMLLinkElement;
    if (!canonical) {
        return null;
    }

    const a = document.createElement("a");
    a.href = canonical.href;
    return a;
}

function getBrowserReferrer(hostname: string, referrer: string): string {
    // First, check if we have an explicit referrer parameter
    if (referrer) {
        return getReferrer(hostname, referrer);
    }

    // If no explicit referrer, check document.referrer
    if (document.referrer && document.referrer.indexOf(hostname) < 0) {
        return getReferrer(hostname, document.referrer);
    }

    // If still no referrer, check query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const referrerParams = [
        "ref",
        "referer",
        "referrer",
        "source",
        "utm_source",
    ];

    for (const param of referrerParams) {
        const value = urlParams.get(param);
        if (value) {
            return getReferrer(hostname, value);
        }
    }

    return getReferrer(hostname, "");
}

export async function trackPageview(
    client: Client,
    opts: TrackPageviewOpts = {},
) {
    const canonical = getCanonicalUrl();
    const location = canonical ?? window.location;

    if (
        !client.reportOnLocalhost &&
        isLocalhostAddress(window.location.hostname)
    ) {
        return;
    }

    // if host is empty, we're probably loading a file:/// URI
    // -- exit early if this is not an Electron app
    if (location.host === "" && navigator.userAgent.indexOf("Electron") < 0) {
        return;
    }

    const url = opts.url || location.pathname + location.search || "/";

    const { hostname, path } = getHostnameAndPath(url, true);
    const referrer = getBrowserReferrer(hostname, opts.referrer || "");
    const utmParams = getUtmParamsFromBrowserUrl(url);

    let hitType: string | undefined;
    let dailyVisitor = true;
    try {
        const cacheStatus = await checkCacheStatus(
            client.reporterUrl,
            client.siteId,
        );
        hitType = cacheStatus.ht.toString();
        dailyVisitor = cacheStatus.ht === 1;
    } catch {
        // If cache check fails, we proceed without hit count data
        // The collect endpoint will handle the missing parameters
    }

    const requestParams = buildCollectRequestParams(
        client.siteId,
        hostname,
        path,
        referrer,
        utmParams,
        hitType,
        getTrackingIdentity(client.siteId, dailyVisitor),
    );

    makeRequest(client.reporterUrl, requestParams);
}

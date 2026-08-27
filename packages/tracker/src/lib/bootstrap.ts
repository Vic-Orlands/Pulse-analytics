export function resolveSiteId(explicit?: string | null, hostname?: string): string {
    const id = (explicit || "").trim();
    if (id) return id;

    const host = (hostname || "").trim().replace(/^www\./i, "");
    return host || "unknown";
}

export function collectUrlFromTrackerSrc(src: string, base?: string): string {
    const value = (src || "").trim();
    if (!value) return "";

    try {
        const url = new URL(value, base || (typeof location !== "undefined" ? location.href : "https://pulse.local"));
        url.pathname = url.pathname.replace(/\/tracker\.js$/i, "/collect");
        url.search = "";
        url.hash = "";
        return url.toString();
    } catch {
        return value.replace(/tracker\.js.*/i, "collect");
    }
}

const PUBLIC_EXACT = new Set([
    "/",
    "/login",
    "/collect",
    "/cache",
    "/tracker.js",
    "/favicon.svg",
    "/favicon.png",
    "/favicon.ico",

    "/pulse-preview.mp4",
]);

const PUBLIC_PREFIXES = ["/collect", "/cache", "/login", "/showcase"];

export function isPublicPath(pathname: string): boolean {
    const normalized = pathname.replace(/\/+$/, "") || "/";
    if (PUBLIC_EXACT.has(pathname) || PUBLIC_EXACT.has(normalized)) {
        return true;
    }

    return PUBLIC_PREFIXES.some(
        (prefix) =>
            pathname === prefix ||
            normalized === prefix ||
            pathname.startsWith(`${prefix}/`) ||
            normalized.startsWith(`${prefix}/`),
    );
}

export function safeLoginRedirect(next: string | null): string {
    if (
        !next ||
        !next.startsWith("/") ||
        next.startsWith("//") ||
        next.startsWith("/login")
    ) {
        return "/dashboard";
    }

    return next;
}

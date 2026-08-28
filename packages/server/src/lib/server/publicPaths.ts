const PUBLIC_EXACT = new Set([
    "/",
    "/login",
    "/collect",
    "/cache",
    "/tracker.js",
    "/favicon.svg",
    "/pulse-preview.mp4",
]);

const PUBLIC_PREFIXES = ["/collect", "/cache", "/login"];

export function isPublicPath(pathname: string): boolean {
    if (PUBLIC_EXACT.has(pathname)) {
        return true;
    }

    return PUBLIC_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
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

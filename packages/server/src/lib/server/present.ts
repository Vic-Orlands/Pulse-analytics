import type { AnalyticsEvent, CountRow } from "$lib/types";

export type EventQueryRow = {
    host?: string;
    userAgent?: string;
    path: string;
    country: string;
    referrer?: string;
    browser?: string;
    deviceModel?: string;
    browserVersion?: string;
    deviceType: string;
    eventType: string;
    eventName: string;
    target: string;
    value: string;
    network?: string;
    region: string;
    city?: string;
    operatingSystem: string;
    visitorId?: string;
    sessionId?: string;
    count: number;
    sessionDepth?: number;
    lastSeen: string;
};

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

export function countryLabel(code: string): string {
    const value = (code || "").trim();
    if (!value) return "";
    if (value.length !== 2) return value;
    try {
        return countryNames.of(value.toUpperCase()) || value;
    } catch {
        return value;
    }
}

function decodeURIComponentSafe(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function uniqueParts(parts: Array<string | undefined>): string[] {
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const part of parts) {
        const value = (part || "").trim();
        if (!value) continue;
        const key = value.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(value);
    }
    return unique;
}

function capitalize(value: string): string {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatPathLabel(raw: string): string {
    const value = decodeURIComponentSafe(raw || "").trim();
    if (!value) return "/";
    try {
        if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) {
            const url = new URL(value);
            return url.pathname || "/";
        }
    } catch {
        // fall through to path formatting
    }
    return value.startsWith("/") ? value : `/${value}`;
}

export function formatHostLabel(raw: string): string {
    const value = (raw || "").trim();
    if (!value) return "(unknown host)";
    try {
        const url = value.includes("://") ? new URL(value) : new URL(`https://${value}`);
        const host = (url.hostname || url.host).replace(/^www\./i, "");
        return host || value;
    } catch {
        return value.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "").replace(/^www\./i, "").split("/")[0] || value;
    }
}

export function formatReferrerLabel(raw: string): string {
    const value = (raw || "").trim();
    if (!value || /^(direct|\(direct\)|\(none\)|null|undefined)$/i.test(value)) {
        return "Direct";
    }
    return formatHostLabel(value);
}

export function presentCountRows(
    rows: CountRow[],
    formatLabel: (raw: string) => string,
): CountRow[] {
    const grouped = new Map<string, [number, number]>();

    for (const [raw, visitors, views = visitors] of rows) {
        const label = formatLabel(raw);
        const current = grouped.get(label) ?? [0, 0];
        grouped.set(label, [current[0] + Number(visitors || 0), current[1] + Number(views || 0)]);
    }

    return Array.from(grouped, ([label, counts]) => [label, counts[0], counts[1]] as CountRow)
        .sort((a, b) => b[1] - a[1] || b[2]! - a[2]!);
}

export function originLabel(country: string, region: string, city = ""): string {
    return uniqueParts([city, region, countryLabel(country)]).join(", ") || "Unknown origin";
}

export function deviceLabel(deviceType: string, operatingSystem: string, browser = ""): string {
    return uniqueParts([capitalize(deviceType || "device"), operatingSystem, browser]).join(" · ") || "Unknown device";
}

export function eventHeadline(type: AnalyticsEvent["type"], name: string, value: string): string {
    const copied = (value || "").trim();
    if (type === "copy" && copied) {
        const snippet = copied.length > 96 ? `${copied.slice(0, 93)}…` : copied;
        return `Copied “${snippet}”`;
    }
    return (name || "").trim() || `${capitalize(type)} event`;
}

export function presentEvents(rows: EventQueryRow[]): AnalyticsEvent[] {
    return rows.map((row, index) => {
        const type = (
            ["screenshot", "copy", "scrape", "interaction"].includes(row.eventType)
                ? row.eventType
                : "interaction"
        ) as AnalyticsEvent["type"];
        const occurredAtDate = new Date(row.lastSeen);
        const occurredAt = Number.isNaN(occurredAtDate.getTime())
            ? new Date().toISOString()
            : occurredAtDate.toISOString();
        const lastSeen = Number.isNaN(occurredAtDate.getTime())
            ? "Unknown time"
            : occurredAtDate.toLocaleString();
        const path = formatPathLabel(row.path || row.target || "/");
        const detail = (row.value || "").trim();

        return {
            id: `SIG-${String(index + 1).padStart(4, "0")}`,
            type,
            label: eventHeadline(type, row.eventName, detail),
            target: row.target || path,
            detail,
            count: Number(row.count) || 0,
            change: 0,
            lastSeen,
            occurredAt,
            origin: originLabel(row.country, row.region, row.city),
            device: deviceLabel(row.deviceType, row.operatingSystem, row.browser),
            visitor: {
                id: row.visitorId || "",
                sessionId: row.sessionId || "",
                network: row.network || "",
                country: countryLabel(row.country) || row.country || "",
                region: row.region || "",
                city: row.city || "",
                browser: row.browser || "",
                browserVersion: row.browserVersion || "",
                operatingSystem: row.operatingSystem || "",
                deviceType: row.deviceType || "",
                deviceModel: row.deviceModel || "",
                userAgent: row.userAgent || "",
                hostname: row.host || "",
                path,
                referrer: formatReferrerLabel(row.referrer || ""),
                sessionDepth: Number(row.sessionDepth || 1),
                firstSeen: "Current retention window",
                lastSeen,
            },
        };
    });
}

import type { TrackingIdentity } from "../shared/types";

const SESSION_TIMEOUT = 30 * 60 * 1000;

type SessionRecord = {
    id: string;
    lastSeen: number;
    hits: number;
};

function randomId() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function read<T>(key: string): T | undefined {
    try {
        const value = localStorage.getItem(key);
        return value ? (JSON.parse(value) as T) : undefined;
    } catch {
        return undefined;
    }
}

function write(key: string, value: unknown) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        return;
    }
}

export function getTrackingIdentity(siteId: string, dailyVisitor: boolean): TrackingIdentity {
    const visitorKey = `pulse:${siteId}:visitor`;
    const sessionKey = `pulse:${siteId}:session`;
    const visitorId = read<string>(visitorKey) || randomId();
    const now = Date.now();
    const currentSession = read<SessionRecord>(sessionKey);
    const newSession = !currentSession || now - currentSession.lastSeen > SESSION_TIMEOUT;
    const session: SessionRecord = newSession
        ? { id: randomId(), lastSeen: now, hits: 1 }
        : { ...currentSession, lastSeen: now, hits: currentSession.hits + 1 };

    write(visitorKey, visitorId);
    write(sessionKey, session);

    return {
        dailyVisitor,
        sessionHits: Math.min(3, session.hits),
        sessionDepth: session.hits,
        newSession,
        visitorId,
        sessionId: session.id,
    };
}

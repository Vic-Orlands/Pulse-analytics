import type { CollectRequestParams, TrackingIdentity, UtmParams } from "./types";
import { queryParamStringify } from "./utils";

export function buildCollectRequestParams(
    siteId: string,
    hostname: string,
    path: string,
    referrer: string,
    utmParams: UtmParams = {},
    hitType?: string,
    identity?: TrackingIdentity,
): CollectRequestParams {
    const params: CollectRequestParams = {
        p: path,
        h: hostname,
        r: referrer,
        sid: siteId,
    };

    if (hitType) {
        params.ht = hitType;
    }

    if (identity) {
        params.dv = identity.dailyVisitor ? "1" : "0";
        params.sh = String(identity.sessionHits);
        params.sd = String(identity.sessionDepth);
        params.ns = identity.newSession ? "1" : "0";
        if (identity.visitorId) params.vid = identity.visitorId;
        if (identity.sessionId) params.ssid = identity.sessionId;
    }

    Object.assign(params, utmParams);

    return params;
}

export function buildCollectUrl(
    baseUrl: string,
    params: CollectRequestParams,
    filterEmpty = false,
): string {
    return baseUrl + queryParamStringify(params, filterEmpty);
}

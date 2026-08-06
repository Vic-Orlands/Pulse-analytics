import type { ClientOpts } from "./src/lib/client";
import type { TrackEventOpts, TrackPageviewOpts } from "./src/lib/track";

declare global {
    interface Window {
        counterscale: {
            q?: unknown[][];
            init: (opts: ClientOpts) => void;
            trackPageview: (opts?: TrackPageviewOpts) => void;
            trackEvent: (opts: TrackEventOpts) => void;
            cleanup: () => void;
        };
    }
}

export {};

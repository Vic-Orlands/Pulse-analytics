<script lang="ts">
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import { Cancel01Icon } from "@hugeicons/core-free-icons";
    import type { AnalyticsEvent } from "$lib/types";

    let { event, onclose }: { event: AnalyticsEvent | null; onclose: () => void } = $props();
    let closeButton = $state<HTMLButtonElement>();

    const names = { screenshot: "Screenshot", copy: "Copy", scrape: "Scraping", interaction: "Interaction", outbound: "Outbound", download: "Download" } as const;
    const meaningful = (value: string) => value || "Not available";

    function handleKeydown(keyboard: KeyboardEvent) {
        if (!event) return;
        if (keyboard.key === "Escape") onclose();
        if (keyboard.key !== "Tab") return;
        const dialog = closeButton?.closest("[role=dialog]");
        const focusable = Array.from(dialog?.querySelectorAll<HTMLElement>('button, [tabindex]:not([tabindex="-1"])') ?? []);
        if (!focusable.length) return;
        if (keyboard.shiftKey && document.activeElement === focusable[0]) { keyboard.preventDefault(); focusable.at(-1)?.focus(); }
        if (!keyboard.shiftKey && document.activeElement === focusable.at(-1)) { keyboard.preventDefault(); focusable[0].focus(); }
    }

    $effect(() => { if (event) window.setTimeout(() => closeButton?.focus(), 20); });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if event}
    <button class="scrim" aria-label="Close event details" onclick={onclose}></button>
    <div class="inspector" role="dialog" aria-modal="true" aria-labelledby="event-title">
        <header>
            <div>
                <span class="kicker">{event.id} · {names[event.type]}</span>
                <h2 id="event-title">{event.label}</h2>
            </div>
            <button bind:this={closeButton} onclick={onclose} aria-label="Close event details"><HugeiconsIcon icon={Cancel01Icon} size={17} strokeWidth={1.6} /></button>
        </header>

        {#if (event.type === "copy" || event.type === "outbound" || event.type === "download") && event.detail}
            <section class="payload">
                <span class="kicker">{event.type === "copy" ? "Copied content" : event.type === "outbound" ? "Destination" : "Downloaded file"}</span>
                <blockquote>{event.detail}</blockquote>
                <p>Captured from {meaningful(event.visitor.path)} · {event.origin} · {event.device}</p>
            </section>
        {:else}
            <section class="event-summary">
                <span class="kicker">Observed signal</span>
                <strong>{event.target}</strong>
                <p>{new Date(event.occurredAt).toLocaleString()} · {event.count.toLocaleString()} observations · {event.origin} · {event.device}</p>
            </section>
        {/if}

        <section>
            <span class="kicker">Where it was registered</span>
            <dl>
                <div><dt>Page</dt><dd>{meaningful(event.visitor.path)}</dd></div>
                <div><dt>Target surface</dt><dd>{meaningful(event.target)}</dd></div>
                <div><dt>Country</dt><dd>{meaningful(event.visitor.country)}</dd></div>
                <div><dt>Region</dt><dd>{meaningful(event.visitor.region)}</dd></div>
                <div><dt>City</dt><dd>{meaningful(event.visitor.city)}</dd></div>
                <div><dt>Referrer</dt><dd>{meaningful(event.visitor.referrer)}</dd></div>
            </dl>
        </section>
        <section>
            <span class="kicker">Device &amp; client</span>
            <dl>
                <div><dt>Device</dt><dd>{meaningful(event.visitor.deviceType)}</dd></div>
                <div><dt>Operating system</dt><dd>{meaningful(event.visitor.operatingSystem)}</dd></div>
                <div><dt>Browser</dt><dd>{meaningful(`${event.visitor.browser} ${event.visitor.browserVersion}`.trim())}</dd></div>
                <div><dt>Device model</dt><dd>{meaningful(event.visitor.deviceModel)}</dd></div>
            </dl>
            {#if event.visitor.userAgent}<pre>{event.visitor.userAgent}</pre>{/if}
        </section>
        <section>
            <span class="kicker">Anonymous visitor</span>
            <dl>
                <div><dt>Visitor ID</dt><dd>{meaningful(event.visitor.id)}</dd></div>
                <div><dt>Session ID</dt><dd>{meaningful(event.visitor.sessionId)}</dd></div>
                <div><dt>Network</dt><dd>{meaningful(event.visitor.network)}</dd></div>
                <div><dt>Session depth</dt><dd>{event.visitor.sessionDepth} pages</dd></div>
                <div><dt>Hostname</dt><dd>{meaningful(event.visitor.hostname)}</dd></div>
                <div><dt>Last seen</dt><dd>{meaningful(event.visitor.lastSeen)}</dd></div>
            </dl>
        </section>
        <p class="privacy">Copied text is truncated and never collected from password, email, or other form fields. Network addresses are stored at a reduced prefix.</p>
    </div>
{/if}

<style>
    .scrim {
        position: fixed;
        z-index: 70;
        inset: 0;
        border: 0;
        background: color-mix(in srgb, var(--ink) 28%, transparent);
    }

    .inspector {
        position: fixed;
        z-index: 80;
        inset: 12px 12px 12px auto;
        width: min(440px, calc(100% - 24px));
        overflow-y: auto;
        color: var(--ink);
        background: var(--panel);
        border-radius: 20px;
        box-shadow: var(--shadow);
    }

    .inspector > header {
        position: sticky;
        z-index: 2;
        top: 0;
        display: flex;
        align-items: start;
        justify-content: space-between;
        padding: 22px;
        border-bottom: 1px solid var(--line);
        background: color-mix(in srgb, var(--panel) 94%, transparent);
        backdrop-filter: blur(12px);
    }

    h2, p, blockquote { margin: 0; }
    h2 { margin-top: 8px; font-size: var(--text-lg); font-weight: 600; letter-spacing: -0.02em; line-height: 1.3; }

    .inspector > header button {
        display: grid;
        width: 36px;
        height: 36px;
        place-items: center;
        border: 1px solid var(--line);
        border-radius: 12px;
        color: var(--ink);
        background: transparent;
        cursor: pointer;
    }

    .event-summary, .payload { background: color-mix(in srgb, var(--accent) 6%, var(--paper)); }
    .event-summary > strong, .payload blockquote {
        display: block;
        margin: 14px 0 8px;
        font-size: var(--text-lg);
        font-weight: 600;
        line-height: 1.35;
    }
    .payload blockquote {
        max-height: 160px;
        overflow: auto;
        padding: 0;
        border: 0;
        font-size: 13px;
        white-space: pre-wrap;
        word-break: break-word;
    }
    .event-summary p, .payload p { color: var(--muted); font-size: 13px; line-height: 1.5; }
    .inspector > section { padding: 22px; border-bottom: 1px solid var(--line); }
    dl { display: grid; grid-template-columns: 1fr 1fr; margin: 16px 0 0; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
    dl > div { min-width: 0; padding: 12px; border-bottom: 1px solid var(--line); }
    dl > div:nth-child(2n) { border-left: 1px solid var(--line); }
    dl > div:nth-last-child(-n+2) { border-bottom: 0; }
    dt { margin-bottom: 6px; color: var(--muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
    dd { overflow: hidden; margin: 0; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
    pre {
        overflow-x: auto;
        margin: 12px 0 0;
        padding: 12px;
        border-radius: 12px;
        color: var(--muted);
        background: color-mix(in srgb, var(--ink) 4%, var(--paper));
        font-size: 12px;
        white-space: pre-wrap;
        word-break: break-word;
    }
    .privacy { margin: 20px 22px; color: var(--muted); font-size: 12px; line-height: 1.6; }

    @media (max-width: 600px) {
        .inspector { inset: 8px 8px 86px; width: auto; }
    }
</style>

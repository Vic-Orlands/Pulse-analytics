<script lang="ts">
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import { Cancel01Icon } from "@hugeicons/core-free-icons";
    import type { AnalyticsEvent } from "$lib/types";

    let { event, onclose }: { event: AnalyticsEvent | null; onclose: () => void } = $props();
    let closeButton = $state<HTMLButtonElement>();

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
        <header><div><span>{event.id} / {event.type}</span><h2 id="event-title">{event.label}</h2></div><button bind:this={closeButton} onclick={onclose} aria-label="Close event details"><HugeiconsIcon icon={Cancel01Icon} size={17} strokeWidth={1.6} /></button></header>
        <section class="event-summary"><span>Observed signal</span><strong>{event.target}</strong><p>{new Date(event.occurredAt).toLocaleString()} · {event.count.toLocaleString()} observations</p></section>
        <section><span>Anonymous visitor</span><dl><div><dt>Visitor ID</dt><dd>{meaningful(event.visitor.id)}</dd></div><div><dt>Session ID</dt><dd>{meaningful(event.visitor.sessionId)}</dd></div><div><dt>Network</dt><dd>{meaningful(event.visitor.network)}</dd></div><div><dt>Session depth</dt><dd>{event.visitor.sessionDepth} pages</dd></div><div><dt>First seen</dt><dd>{meaningful(event.visitor.firstSeen)}</dd></div><div><dt>Last seen</dt><dd>{meaningful(event.visitor.lastSeen)}</dd></div></dl></section>
        <section><span>Location</span><dl><div><dt>Country</dt><dd>{meaningful(event.visitor.country)}</dd></div><div><dt>Region</dt><dd>{meaningful(event.visitor.region)}</dd></div><div><dt>City</dt><dd>{meaningful(event.visitor.city)}</dd></div></dl></section>
        <section><span>Client environment</span><dl><div><dt>Browser</dt><dd>{meaningful(`${event.visitor.browser} ${event.visitor.browserVersion}`.trim())}</dd></div><div><dt>Operating system</dt><dd>{meaningful(event.visitor.operatingSystem)}</dd></div><div><dt>Device</dt><dd>{meaningful(`${event.visitor.deviceType} · ${event.visitor.deviceModel}`)}</dd></div></dl><pre>{meaningful(event.visitor.userAgent)}</pre></section>
        <section><span>Journey context</span><dl><div><dt>Hostname</dt><dd>{meaningful(event.visitor.hostname)}</dd></div><div><dt>Page</dt><dd>{meaningful(event.visitor.path)}</dd></div><div><dt>Referrer</dt><dd>{meaningful(event.visitor.referrer)}</dd></div></dl></section>
        <p class="privacy">Network addresses are stored at a reduced prefix. Visitor and session IDs are pseudonymous and rotate according to the collector identity policy.</p>
    </div>
{/if}

<style>
    .scrim{position:fixed;z-index:70;inset:0;border:0;background:color-mix(in srgb,var(--ink) 24%,transparent);animation:fade-in 240ms ease-out both}.inspector{position:fixed;z-index:80;inset:12px 12px 12px auto;width:min(430px,calc(100% - 24px));overflow-y:auto;color:var(--ink);background:var(--panel);box-shadow:0 0 0 1px var(--line),-28px 0 90px color-mix(in srgb,var(--ink) 18%,transparent);animation:inspector-in 260ms cubic-bezier(.22,1,.36,1) both}.inspector>header{position:sticky;z-index:2;top:0;display:flex;align-items:start;justify-content:space-between;padding:24px;box-shadow:0 1px var(--line);background:color-mix(in srgb,var(--panel) 94%,transparent);backdrop-filter:blur(12px)}span{color:var(--muted);font-family:"IBM Plex Mono",monospace;font-size:8px;letter-spacing:.07em;text-transform:uppercase}h2,p{margin:0}h2{margin-top:7px;font-family:"Instrument Serif",Georgia,serif;font-size:34px;font-weight:400;letter-spacing:-.035em}.inspector>header button{display:grid;width:34px;height:34px;place-items:center;border:0;box-shadow:0 0 0 1px var(--line);color:var(--ink);background:transparent;cursor:pointer}.event-summary{background:color-mix(in srgb,var(--accent) 6%,var(--paper))}.event-summary>strong{display:block;margin:14px 0 7px;font-family:"Instrument Serif",Georgia,serif;font-size:25px;font-weight:400}.event-summary p{color:var(--muted);font-size:8px}.inspector>section{padding:22px 24px;box-shadow:0 1px var(--line)}dl{position:relative;display:grid;grid-template-columns:1fr 1fr;margin:20px 0 6px;border-block:1px solid var(--line)}dl::before,dl::after{position:absolute;top:-7px;bottom:-7px;width:1px;background:var(--line);content:""}dl::before{left:0}dl::after{right:0}dl>div{min-width:0;padding:12px;box-shadow:0 1px var(--line)}dl>div:nth-child(2n){box-shadow:-1px 1px var(--line)}dt{margin-bottom:6px;color:var(--muted);font-family:"IBM Plex Mono",monospace;font-size:7px;text-transform:uppercase}dd{overflow:hidden;margin:0;font-size:9px;text-overflow:ellipsis;white-space:nowrap}pre{overflow-x:auto;margin:12px 0 0;padding:11px;color:var(--muted);background:color-mix(in srgb,var(--ink) 3%,var(--paper));font-family:"IBM Plex Mono",monospace;font-size:7px;line-height:1.55;white-space:pre-wrap;word-break:break-word}.privacy{margin:22px 24px;color:var(--muted);font-size:8px;line-height:1.6}button:focus-visible{outline:2px solid var(--accent);outline-offset:3px}@keyframes fade-in{from{opacity:0}}@keyframes inspector-in{from{opacity:.7;transform:translateX(102%)}}@media(max-width:600px){.inspector{inset:8px 8px 74px;width:auto}}@media(prefers-reduced-motion:reduce){.scrim,.inspector{animation:none}}
</style>

<script lang="ts">
    import { onMount } from "svelte";
    import { animate, stagger } from "motion";
    import type { AnalyticsEvent } from "$lib/types";
    import type { PageProps } from "./$types";
    import AppShell from "$lib/components/AppShell.svelte";
    import InstallationSheet from "$lib/components/InstallationSheet.svelte";
    import EventInspector from "$lib/components/EventInspector.svelte";

    let { data }: PageProps = $props();
    let filter = $state<"all" | AnalyticsEvent["type"]>("all");
    let installationOpen = $state(false);
    let selectedEvent = $state<AnalyticsEvent | null>(null);
    const filtered = $derived(filter === "all" ? data.events : data.events.filter((event) => event.type === filter));
    const total = $derived(data.events.reduce((sum, event) => sum + event.count, 0));
    const overlayOpen = $derived(installationOpen || selectedEvent !== null);

    const names = {
        screenshot: "Screenshot",
        copy: "Copy",
        scrape: "Scraping",
        interaction: "Interaction",
        outbound: "Outbound",
        download: "Download",
    } as const;
    const descriptions = {
        screenshot: "Captures",
        copy: "Copied text",
        scrape: "Scraping",
        interaction: "Clicks",
        outbound: "Leaves",
        download: "Files",
    } as const;

    function closeOverlay() {
        const eventId = selectedEvent?.id;
        installationOpen = false;
        selectedEvent = null;
        window.setTimeout(() => document.getElementById(eventId ? `event-${eventId}` : "installation-trigger")?.focus(), 20);
    }

    onMount(() => {
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            animate("[data-reveal]", { opacity: [0, 1], y: [8, 0] }, { duration: 0.28, delay: stagger(0.03), ease: [0.22, 1, 0.36, 1] });
        }
    });
</script>

<svelte:head>
    <title>Pulse — Signals</title>
    <meta name="description" content="Event log for Pulse." />
</svelte:head>

<AppShell
    current="signals"
    siteId={data.siteId}
    sites={data.sites}
    interval={data.interval}
    title="Signals"
    oninstall={() => (installationOpen = true)}
>
    <div class="stack" class:dimmed={overlayOpen} inert={overlayOpen ? true : undefined}>
        <section class="hero panel" data-reveal>
            <div>
                <p class="kicker">Events</p>
                <h2>Activity</h2>
                <p>{data.siteId || "This app"}</p>
            </div>
            <div class="total">
                <span class="kicker">Observed</span>
                <strong>{total.toLocaleString()}</strong>
            </div>
        </section>

        <section class="filters" data-reveal>
            {#each ["screenshot", "copy", "scrape", "interaction", "outbound", "download"] as type (type)}
                {@const typed = type as AnalyticsEvent["type"]}
                <button class="panel" class:active={filter === typed} onclick={() => (filter = filter === typed ? "all" : typed)} aria-pressed={filter === typed}>
                    <i data-type={typed}></i>
                    <span class="kicker">{names[typed]}</span>
                    <strong>{data.events.filter((event) => event.type === typed).reduce((sum, event) => sum + event.count, 0)}</strong>
                    <small>{descriptions[typed]}</small>
                </button>
            {/each}
        </section>

        <section class="panel register" data-reveal>
            <header>
                <div>
                    <span class="kicker">{filter === "all" ? "All" : names[filter]}</span>
                    <h2>Log</h2>
                </div>
                <button class="all-filter" class:active={filter === "all"} onclick={() => (filter = "all")} aria-pressed={filter === "all"}>All</button>
            </header>

            <div class="table-head">
                <span>Signal</span>
                <span>What</span>
                <span>Page</span>
                <span>Origin</span>
                <span>Device</span>
                <span>Count</span>
                <span>Last seen</span>
            </div>
            <div class="rows">
                {#each filtered as event (event.id)}
                    <button id={`event-${event.id}`} onclick={() => (selectedEvent = event)} aria-label={`Inspect ${event.label} from ${event.visitor.path} on ${event.device} in ${event.origin}`}>
                        <p class="classification"><i data-type={event.type}></i><span>{names[event.type]}</span></p>
                        <div class="payload">
                            <strong>{event.label}</strong>
                            {#if event.detail && (event.type === "copy" || event.type === "outbound" || event.type === "download")}
                                <code>{event.detail}</code>
                            {:else}
                                <small>{event.target}</small>
                            {/if}
                        </div>
                        <code class="page">{event.visitor.path}</code>
                        <span class="origin">{event.origin}</span>
                        <span class="device">{event.device}</span>
                        <strong class="count">{event.count.toLocaleString()}</strong>
                        <small class="when">{event.lastSeen}</small>
                    </button>
                {:else}
                    <div class="empty">
                        <h3>No signals</h3>
                        <p>Events show up here.</p>
                        {#if data.warnings.length}
                            <p>{data.warnings.join(" · ")}</p>
                        {/if}
                    </div>
                {/each}
            </div>
        </section>
    </div>
</AppShell>
<InstallationSheet open={installationOpen} onclose={closeOverlay} />
<EventInspector event={selectedEvent} onclose={closeOverlay} />

<style>
    .dimmed { opacity: 0.46; transition: opacity 220ms ease; }
    .hero { display: flex; align-items: end; justify-content: space-between; gap: 24px; padding: 20px; }
    .hero h2 { margin: 6px 0; font-size: var(--text-lg); font-weight: 500; letter-spacing: -0.02em; line-height: 1.3; }
    .hero p { max-width: 520px; margin: 0; color: var(--muted); }
    .total { display: grid; justify-items: end; gap: 6px; }
    .total strong { font-size: var(--text-lg); font-weight: 500; letter-spacing: -0.02em; }
    .filters { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    .filters button { display: grid; min-height: 112px; align-content: start; padding: 16px; border: 1px solid var(--line); color: inherit; background: var(--panel); text-align: left; cursor: pointer; }
    .filters button.active, .filters button:hover { border-color: color-mix(in srgb, var(--accent) 40%, var(--line)); background: color-mix(in srgb, var(--accent) 6%, var(--panel)); }
    .filters i, .classification i { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }
    i[data-type="copy"] { background: var(--comparison); }
    i[data-type="scrape"] { background: var(--warn); }
    i[data-type="interaction"] { background: var(--muted); }
    i[data-type="outbound"] { background: var(--ok); }
    i[data-type="download"] { background: var(--ink); }
    .filters strong { margin: 10px 0 8px; font-size: var(--text-lg); font-weight: 500; }
    .filters small { color: var(--muted); font-size: 12px; line-height: 1.45; }
    .register > header { display: flex; align-items: end; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--line); }
    .register h2 { margin: 4px 0 0; font-size: var(--text-lg); font-weight: 500; }
    .all-filter { min-height: 34px; padding: 0 12px; border: 1px solid var(--line); border-radius: 999px; color: var(--muted); background: transparent; font-size: 12px; font-weight: 500; cursor: pointer; }
    .all-filter.active { color: var(--paper); background: var(--ink); }
    .table-head, .rows > button { display: grid; grid-template-columns: 0.8fr 1.7fr 0.8fr 0.9fr 0.9fr 0.4fr 0.7fr; align-items: center; gap: 12px; }
    .table-head { padding: 12px 20px; border-bottom: 1px solid var(--line); color: var(--muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
    .rows > button { width: 100%; min-height: 84px; padding: 14px 20px; border: 0; border-bottom: 1px solid var(--line); color: inherit; background: transparent; text-align: left; cursor: pointer; }
    .rows > button:hover, .rows > button:focus-visible { background: color-mix(in srgb, var(--accent) 6%, transparent); }
    .classification { display: flex; align-items: center; gap: 8px; margin: 0; }
    .classification span { color: var(--muted); font-size: 12px; }
    .payload { min-width: 0; display: grid; gap: 6px; }
    .payload strong { overflow: hidden; font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
    .payload code, .page { display: block; overflow: hidden; max-width: 100%; color: var(--muted); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
    .payload code { padding: 4px 6px; color: var(--ink); background: color-mix(in srgb, var(--ink) 5%, transparent); border-radius: 6px; }
    .origin, .device, .when { overflow: hidden; color: var(--muted); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
    .count { font-size: var(--text-lg); font-weight: 500; }
    .empty { display: grid; place-items: center; padding: 64px 20px; text-align: center; }
    .empty h3 { margin: 0 0 8px; font-size: var(--text-lg); }
    .empty p { max-width: 460px; margin: 0; color: var(--muted); }
    [data-reveal] { opacity: 0; }
    @media (max-width: 900px) {
        .filters { grid-template-columns: 1fr 1fr; }
        .hero { flex-direction: column; align-items: start; }
        .total { justify-items: start; }
        .table-head { display: none; }
        .rows > button { grid-template-columns: 1fr 1fr; gap: 8px 16px; }
        .payload, .page { grid-column: 1 / -1; }
    }
    @media (max-width: 620px) {
        .filters { grid-template-columns: 1fr; }
        .rows > button { grid-template-columns: 1fr; }
    }
    @media (prefers-reduced-motion: reduce) {
        [data-reveal] { opacity: 1; }
        .dimmed { transition: none; }
    }
</style>

<script lang="ts">
    import { onMount } from "svelte";
    import { animate, stagger } from "motion";
    import type { AnalyticsEvent } from "$lib/types";
    import type { PageProps } from "./$types";
    import AppRail from "$lib/components/AppRail.svelte";
    import InstallationSheet from "$lib/components/InstallationSheet.svelte";
    import EventInspector from "$lib/components/EventInspector.svelte";
    import { applyTheme, defaultTheme, readTheme, saveTheme, type ThemeId } from "$lib/theme";

    let { data }: PageProps = $props();
    let theme = $state<ThemeId>(defaultTheme);
    let filter = $state<"all" | AnalyticsEvent["type"]>("all");
    let installationOpen = $state(false);
    let selectedEvent = $state<AnalyticsEvent | null>(null);
    const filtered = $derived(filter === "all" ? data.events : data.events.filter((event) => event.type === filter));
    const total = $derived(data.events.reduce((sum, event) => sum + event.count, 0));

    const names = { screenshot: "Screenshot", copy: "Copy", scrape: "Scraping", interaction: "Interaction" } as const;
    const descriptions = {
        screenshot: "Captures initiated from monitored surfaces",
        copy: "Text and code copied from high-intent pages",
        scrape: "Automated extraction patterns requiring review",
        interaction: "Meaningful actions outside ordinary navigation",
    } as const;

    function toggleTheme() {
        theme = theme === "signal" ? "observatory" : "signal";
        saveTheme(theme);
    }

    function closeOverlay() {
        const eventId = selectedEvent?.id;
        installationOpen = false;
        selectedEvent = null;
        window.setTimeout(() => document.getElementById(eventId ? `event-${eventId}` : "installation-trigger")?.focus(), 20);
    }

    onMount(() => {
        theme = readTheme() ?? defaultTheme;
        applyTheme(theme);
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            animate("[data-reveal]", { opacity: [0, 1], y: [8, 0] }, { duration: 0.34, delay: stagger(0.035), ease: [0.22, 1, 0.36, 1] });
        }
    });
</script>

<svelte:head>
    <title>Signal Ledger — Counterscale</title>
    <meta name="description" content="A classified register of high-intent analytics events." />
</svelte:head>

    <div class="ledger text-xs [&_small]:!text-xs [&_p]:!text-xs [&_.kicker]:!text-xs [&_.summary_span]:!text-xs [&_.table-head]:!text-xs [&_.rows_code]:!text-xs [&_.rows_button]:!text-xs [&_.rows_button_small]:!text-xs [&_.rows_button_b]:!text-xs [&_.payload_code]:!text-xs" data-theme={theme}>
    <AppRail {theme} current="signals" ontheme={toggleTheme} oninstall={() => (installationOpen = true)} />
    <div class="app-stage" class:sheet-open={installationOpen || selectedEvent !== null} inert={installationOpen || selectedEvent !== null ? true : undefined}>
    <header class="masthead">
        <div class="nav-frame">
            <a class="brand" href={`/?site=${data.siteId}&interval=${data.interval}`}><span class="mark" aria-hidden="true"><i></i><i></i><i></i></span> Pulse</a>
            <span>Signal Ledger</span>
            <form method="GET"><input type="hidden" name="interval" value={data.interval} /><label><span class="sr-only">Application</span><select name="site" value={data.siteId} onchange={(event) => event.currentTarget.form?.requestSubmit()}>{#each data.sites as site}<option value={site}>{site}</option>{/each}</select></label></form>
        </div>
    </header>

    <main class="frame">
        <section class="ledger-head" data-reveal>
            <div><h1>The Signal<br /><em>Ledger.</em></h1></div>
            <p>High-intent behavior deserves a separate reading surface. This register records what was copied or captured, the page it came from, and the device, region, and country that registered it.</p>
        </section>

        <section class="summary" data-reveal>
            <div><span>Total observed</span><strong>{total.toLocaleString()}</strong><small>Across the selected period</small></div>
            {#each ["screenshot", "copy", "scrape", "interaction"] as type}
                {@const typed = type as AnalyticsEvent["type"]}
                <button class:active={filter === typed} onclick={() => (filter = filter === typed ? "all" : typed)} aria-pressed={filter === typed}>
                    <i data-type={typed}></i><span>{names[typed]}</span><strong>{data.events.filter((event) => event.type === typed).reduce((sum, event) => sum + event.count, 0)}</strong><small>{descriptions[typed]}</small>
                </button>
            {/each}
        </section>

        <section class="register" data-reveal>
            <header>
                <div><span class="kicker">Observed events / {filter === "all" ? "All classifications" : names[filter]}</span><h2>Activity register</h2></div>
                <button class="all-filter" class:active={filter === "all"} onclick={() => (filter = "all")} aria-pressed={filter === "all"}>All signals</button>
            </header>

            <div class="table-head"><span>Signal</span><span>What was registered</span><span>Page</span><span>Origin</span><span>Device</span><span>Count</span><span>Last seen</span></div>
            <div class="rows">
                {#each filtered as event (event.id)}
                    <button id={`event-${event.id}`} onclick={() => (selectedEvent = event)} aria-label={`Inspect ${event.label} from ${event.visitor.path} on ${event.device} in ${event.origin}`}>
                        <p class="classification"><i data-type={event.type}></i><span>{names[event.type]}</span></p>
                        <div class="payload">
                            <strong>{event.label}</strong>
                            {#if event.detail && event.type === "copy"}
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
                    <div class="empty"><span>∅</span><h3>No classified signals yet.</h3><p>Copy actions, screenshots, and other events will appear here with the captured content, page, device, and region.</p></div>
                {/each}
            </div>
        </section>

        <section class="method" data-reveal>
            <span class="kicker">Reading protocol / 09</span>
            <div><strong>01</strong><h3>Observed</h3><p>A deliberate interaction enters the event stream with the captured content, page, device, and region.</p></div>
            <div><strong>02</strong><h3>Classified</h3><p>The signal is grouped as capture, copy, scraping, or contextual interaction.</p></div>
            <div><strong>03</strong><h3>Reviewed</h3><p>Open a row to inspect the exact payload and the location it was registered from.</p></div>
        </section>

    </main>
    </div>
    <InstallationSheet open={installationOpen} sites={data.sites} onclose={closeOverlay} />
    <EventInspector event={selectedEvent} onclose={closeOverlay} />
</div>

<style>
    :global(*) { box-sizing: border-box; }
    .ledger { --paper:#eae6dc;--panel:#f2eee4;--ink:#171715;--muted:#74745a;--line:rgba(23,23,21,.12);--accent:#7c2f35;--comparison:#a8a495; min-height:100vh; color:var(--ink); background:var(--paper); font-family:"Plus Jakarta Sans Variable",system-ui,sans-serif; }
    .ledger[data-theme="signal"] { --paper:#111014;--panel:#19171d;--ink:#f0ece4;--muted:#9e969d;--line:rgba(240,236,228,.105);--accent:#ff6759;--comparison:#81c4cf; background:linear-gradient(rgba(129,196,207,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(129,196,207,.035) 1px,transparent 1px),var(--paper);background-size:40px 40px; }
    button,select { font:inherit; }.app-stage{min-height:100vh;transform-origin:left center;transition:opacity 260ms ease-out,transform 260ms cubic-bezier(.22,1,.36,1)}.app-stage.sheet-open{opacity:.46;transform:scale(.97) translateX(-10px)}.frame,.nav-frame{width:min(1120px,calc(100% - 140px));margin:0 auto}.masthead{position:sticky;z-index:10;top:0;box-shadow:0 1px color-mix(in srgb,var(--ink) 8%,transparent);background:color-mix(in srgb,var(--paper) 90%,transparent);backdrop-filter:blur(14px)}.nav-frame{display:flex;min-height:58px;align-items:center;gap:24px}.brand{display:flex;align-items:center;gap:9px;color:var(--ink);font-family:"Instrument Serif",Georgia,serif;font-size:19px;text-decoration:none}.mark{display:flex;align-items:end;gap:2px;width:15px;height:14px}.mark i{width:3px;height:7px;background:var(--accent)}.mark i:nth-child(2){height:13px}.mark i:nth-child(3){height:10px}.nav-frame>span{margin-right:auto;color:var(--muted);font-family:"IBM Plex Mono",monospace;font-size:8px;text-transform:uppercase}.nav-frame select{max-width:140px;border:0;padding:6px 22px 6px 0;color:var(--muted);background:transparent;font-family:"IBM Plex Mono",monospace;font-size:8px;text-transform:uppercase}
    .frame{padding:clamp(52px,7vw,86px) 0 28px}.kicker{display:block;margin-bottom:12px;color:var(--muted);font-family:"IBM Plex Mono",monospace;font-size:9px;letter-spacing:.08em;text-transform:uppercase}h1,h2,h3,p{margin:0}h1,h2{font-family:"Instrument Serif",Georgia,serif;font-weight:400}h1{font-size:clamp(54px,8vw,98px);line-height:.82;letter-spacing:-.055em}h1 em{color:var(--accent);font-weight:400}.ledger-head{display:grid;grid-template-columns:1.1fr .9fr;align-items:end;gap:70px;padding-bottom:48px}.ledger-head>p{max-width:440px;padding-left:24px;border-left:1px solid var(--line);color:var(--muted);font-size:11px;line-height:1.8}
    .summary,.register,.method{position:relative;border-block:1px solid var(--line);background:color-mix(in srgb,var(--panel) 52%,transparent)}.summary::before,.summary::after,.register::before,.register::after,.method::before,.method::after{position:absolute;z-index:2;top:-8px;bottom:-8px;width:1px;background:var(--line);content:"";pointer-events:none}.summary::before,.register::before,.method::before{left:0}.summary::after,.register::after,.method::after{right:0}
    .summary{display:grid;grid-template-columns:1.05fr repeat(4,1fr)}.summary>div,.summary>button{display:flex;min-width:0;min-height:160px;flex-direction:column;align-items:flex-start;padding:20px;border:0;color:var(--ink);background:transparent;text-align:left}.summary>div+button,.summary>button+button{box-shadow:-1px 0 var(--line)}.summary>button{cursor:pointer;transition:background 160ms ease}.summary>button:hover,.summary>button.active{background:color-mix(in srgb,var(--accent) 7%,transparent)}.summary span{color:var(--muted);font-family:"IBM Plex Mono",monospace;font-size:8px;text-transform:uppercase}.summary strong{margin:22px 0 10px;font-family:"Instrument Serif",Georgia,serif;font-size:36px;font-weight:400}.summary small{margin-top:auto;color:var(--muted);font-size:8px;line-height:1.5}.summary i,.register i{width:7px;height:7px;margin-bottom:12px;border-radius:50%;background:var(--accent)}i[data-type="copy"]{background:var(--comparison)}i[data-type="scrape"]{background:#d29a48}i[data-type="interaction"]{background:#7f8ed6}
    .register{margin-top:46px}.register>header{display:flex;align-items:end;justify-content:space-between;padding:28px;box-shadow:0 1px var(--line)}h2{font-size:38px;line-height:1}.all-filter{padding:7px 10px;border:0;box-shadow:0 0 0 1px var(--line);color:var(--muted);background:transparent;font-family:"IBM Plex Mono",monospace;font-size:8px;text-transform:uppercase;cursor:pointer}.all-filter.active{color:var(--paper);background:var(--ink)}.table-head,.rows>button{display:grid;grid-template-columns:.72fr 1.7fr .8fr .9fr .9fr .38fr .7fr;align-items:center;gap:12px}.table-head{padding:11px 20px;box-shadow:0 1px var(--line);color:var(--muted);font-family:"IBM Plex Mono",monospace;font-size:7px;text-transform:uppercase}.rows>button{width:100%;min-height:84px;padding:14px 20px;border:0;box-shadow:0 1px var(--line);color:var(--ink);background:transparent;font-size:10px;text-align:left;cursor:pointer;transition:background 150ms ease}.rows>button:last-child{box-shadow:none}.rows>button:hover,.rows>button:focus-visible{background:color-mix(in srgb,var(--accent) 6%,transparent)}.classification{display:flex;align-items:center;gap:8px}.classification i{flex:0 0 auto;margin:0}.classification span{color:var(--muted);font-family:"IBM Plex Mono",monospace;font-size:7px;text-transform:uppercase}.payload{min-width:0;display:grid;gap:6px}.payload strong{overflow:hidden;font-weight:500;text-overflow:ellipsis;white-space:nowrap}.payload code,.page{display:block;overflow:hidden;max-width:100%;color:var(--muted);font-family:"IBM Plex Mono",monospace;font-size:8px;line-height:1.45;text-overflow:ellipsis;white-space:nowrap}.payload code{padding:4px 6px;color:var(--ink);background:color-mix(in srgb,var(--ink) 4%,transparent)}.origin,.device,.when{overflow:hidden;color:var(--muted);font-family:"IBM Plex Mono",monospace;font-size:8px;text-overflow:ellipsis;white-space:nowrap}.count{font-family:"Instrument Serif",Georgia,serif;font-size:22px;font-weight:400}.empty{display:grid;place-items:center;padding:74px 20px;text-align:center}.empty>span{color:var(--accent);font-family:"Instrument Serif",Georgia,serif;font-size:36px}.empty h3{margin:12px 0 6px;font-family:"Instrument Serif",Georgia,serif;font-size:26px;font-weight:400}.empty p{color:var(--muted);font-size:9px}
    .method{display:grid;grid-template-columns:.75fr repeat(3,1fr);gap:0;margin-top:46px}.method>.kicker{padding:22px}.method>div{min-height:170px;padding:22px;box-shadow:-1px 0 var(--line)}.method>div>strong{color:var(--accent);font-family:"IBM Plex Mono",monospace;font-size:9px}.method h3{margin:30px 0 9px;font-family:"Instrument Serif",Georgia,serif;font-size:24px;font-weight:400}.method p{color:var(--muted);font-size:9px;line-height:1.55}[data-reveal]{opacity:0}button:focus-visible,a:focus-visible,select:focus-visible{outline:2px solid var(--accent);outline-offset:3px}:global(.sr-only){position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    @media(max-width:850px){.summary{grid-template-columns:1fr 1fr}.summary>div{grid-column:1/-1;border-right:0;border-bottom:1px solid var(--line)}.summary>button:nth-child(3),.summary>button:nth-child(5){border-right:0}.summary>button:nth-child(-n+3){border-bottom:1px solid var(--line)}.table-head{display:none}.rows>button{grid-template-columns:1fr 1fr;gap:8px 16px;min-height:0;padding:16px}.classification{grid-column:1}.count{grid-column:2;justify-self:end}.payload{grid-column:1/-1}.page,.origin,.device,.when{grid-column:auto}.method{grid-template-columns:1fr}.method>div{border-top:1px solid var(--line);border-left:0}}
    @media(max-width:620px){.frame,.nav-frame{width:min(100% - 28px,1160px)}.frame{padding-bottom:100px}.nav-frame>span{display:none}.ledger-head{grid-template-columns:1fr;gap:32px}.ledger-head>p{padding-left:16px}.summary{grid-template-columns:1fr}.summary>button{min-height:130px;border-right:0!important;border-bottom:1px solid var(--line)!important}.summary>button:last-child{border-bottom:0!important}.register>header{align-items:start;flex-direction:column;gap:20px}.rows>button{grid-template-columns:1fr}.count,.when{justify-self:start}}
    @media(prefers-reduced-motion:reduce){[data-reveal]{opacity:1}.app-stage,.summary>button,.rows>button{transition:none}}
</style>

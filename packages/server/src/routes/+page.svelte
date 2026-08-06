<script lang="ts">
    import { onMount } from "svelte";
    import { animate, stagger } from "motion";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        Activity01Icon,
        Analytics01Icon,
        BrowserIcon,
        Calendar03Icon,
        ChartLineData01Icon,
        ComputerIcon,
        DashboardSquare01Icon,
        Globe02Icon,
        LaptopPhoneSyncIcon,
        LinkSquare01Icon,
        Location01Icon,
        RefreshIcon,
        Settings01Icon,
    } from "@hugeicons/core-free-icons";
    import type { PageProps } from "./$types";
    import MetricCard from "$lib/components/MetricCard.svelte";
    import TrafficChart from "$lib/components/TrafficChart.svelte";
    import BreakdownCard from "$lib/components/BreakdownCard.svelte";

    let { data }: PageProps = $props();

    const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
    const formatNumber = (value: number) => compact.format(value);
    const formatPercent = (value: number) => `${value.toFixed(1)}%`;

    onMount(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        animate(
            "[data-reveal]",
            { opacity: [0, 1], y: [7, 0] },
            { duration: 0.32, delay: stagger(0.025), ease: [0.22, 1, 0.36, 1] },
        );
    });
</script>

<svelte:head>
    <title>Pulse — Web analytics</title>
    <meta name="description" content="Private analytics across every application." />
</svelte:head>

<div class="shell">
    <aside>
        <a class="brand" href="/" aria-label="Pulse analytics home">
            <span class="brand-mark"><i></i><i></i><i></i></span>
            <span>Pulse</span>
        </a>

        <nav aria-label="Primary navigation">
            <a class="active" href="/">
                <HugeiconsIcon icon={DashboardSquare01Icon} size={15} strokeWidth={1.7} />
                Overview
            </a>
            <a href="#acquisition">
                <HugeiconsIcon icon={ChartLineData01Icon} size={15} strokeWidth={1.7} />
                Acquisition
            </a>
            <a href="#technology">
                <HugeiconsIcon icon={ComputerIcon} size={15} strokeWidth={1.7} />
                Technology
            </a>
        </nav>

        <div class="sidebar-foot">
            <a href="/settings">
                <HugeiconsIcon icon={Settings01Icon} size={15} strokeWidth={1.7} />
                Settings
            </a>
            <div class="storage-note">
                <span><i></i> Collector online</span>
                <small>90-day live window</small>
            </div>
        </div>
    </aside>

    <main>
        <header class="topbar">
            <div>
                <p>Web analytics / Overview</p>
                <h1>{data.siteId}</h1>
            </div>

            <div class="controls">
                <form method="GET">
                    <input type="hidden" name="interval" value={data.interval} />
                    <label>
                        <span class="sr-only">Application</span>
                        <select name="site" value={data.siteId} onchange={(event) => event.currentTarget.form?.requestSubmit()}>
                            {#each data.sites as site}
                                <option value={site}>{site}</option>
                            {/each}
                        </select>
                    </label>
                </form>
                <form method="GET">
                    <input type="hidden" name="site" value={data.siteId} />
                    <label class="interval-control">
                        <HugeiconsIcon icon={Calendar03Icon} size={14} strokeWidth={1.7} />
                        <span class="sr-only">Date range</span>
                        <select name="interval" value={data.interval} onchange={(event) => event.currentTarget.form?.requestSubmit()}>
                            <option value="today">Today</option>
                            <option value="1d">24 hours</option>
                            <option value="7d">7 days</option>
                            <option value="30d">30 days</option>
                            <option value="90d">90 days</option>
                        </select>
                    </label>
                </form>
                <a class="refresh" href={`/?site=${data.siteId}&interval=${data.interval}`} aria-label="Refresh analytics">
                    <HugeiconsIcon icon={RefreshIcon} size={14} strokeWidth={1.7} />
                </a>
            </div>
        </header>

        <div class="content">
            <section class="signal-rail" data-reveal>
                <div class="signal-copy">
                    <span class="live-dot"></span>
                    <strong>Signal is live</strong>
                    <span>Events from {data.siteId} are routed through your Cloudflare Worker.</span>
                </div>
                <div class="signal-meta mono">
                    <span>{data.source === "live" ? "LIVE DATA" : "PREVIEW DATA"}</span>
                    <time datetime={data.generatedAt}>{new Date(data.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
                </div>
            </section>

            <section class="metrics" aria-label="Key metrics">
                <MetricCard label="Unique visitors" value={formatNumber(data.stats.visitors)} detail="Anonymous daily visitors" />
                <MetricCard label="Page views" value={formatNumber(data.stats.views)} detail={`${data.stats.pagesPerVisit.toFixed(2)} pages per visit`} tone="mint" />
                <MetricCard label="Sessions" value={formatNumber(data.stats.sessions)} detail="30-minute inactivity window" tone="ink" />
                <MetricCard label="Bounce rate" value={formatPercent(data.stats.bounceRate)} detail={`${formatNumber(data.stats.bounces)} single-page visits`} tone="amber" />
            </section>

            <section class="traffic-card" data-reveal>
                <header class="section-head">
                    <div>
                        <span>Traffic volume</span>
                        <h2>Views and visitors</h2>
                    </div>
                    <div class="legend">
                        <span><i class="views"></i>Page views</span>
                        <span><i class="visitors"></i>Visitors</span>
                    </div>
                </header>
                <TrafficChart data={data.series} />
            </section>

            <section class="breakdown-grid" id="acquisition">
                <BreakdownCard title="Top pages" eyebrow="Content" rows={data.pages} icon={Analytics01Icon} valueLabel="Visitors" />
                <BreakdownCard title="Referrers" eyebrow="Acquisition" rows={data.referrers} icon={LinkSquare01Icon} valueLabel="Visitors" />
                <BreakdownCard title="Countries" eyebrow="Geography" rows={data.countries} icon={Globe02Icon} valueLabel="Visitors" />
                <BreakdownCard title="Regions" eyebrow="Geography" rows={data.regions} icon={Location01Icon} valueLabel="Visitors" />
            </section>

            <section class="breakdown-grid three" id="technology">
                <BreakdownCard title="Browsers" eyebrow="Technology" rows={data.browsers} icon={BrowserIcon} valueLabel="Visitors" />
                <BreakdownCard title="Operating systems" eyebrow="Technology" rows={data.operatingSystems} icon={ComputerIcon} valueLabel="Visitors" />
                <BreakdownCard title="Device classes" eyebrow="Technology" rows={data.devices} icon={LaptopPhoneSyncIcon} valueLabel="Visitors" />
            </section>

            <footer>
                <span><HugeiconsIcon icon={Activity01Icon} size={13} strokeWidth={1.7} /> Pulse collector</span>
                <span>Private by default · No raw IP storage</span>
            </footer>
        </div>
    </main>
</div>

<style>
    .shell {
        display: grid;
        grid-template-columns: 196px minmax(0, 1fr);
        min-height: 100vh;
    }

    aside {
        position: sticky;
        top: 0;
        display: flex;
        flex-direction: column;
        height: 100vh;
        padding: 18px 13px 14px;
        border-right: 1px solid var(--line);
        background: rgba(248, 250, 253, 0.94);
        backdrop-filter: blur(16px);
    }

    .brand {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 5px 7px 22px;
        color: var(--ink);
        font-size: 14px;
        font-weight: 780;
        letter-spacing: -0.035em;
        text-decoration: none;
    }

    .brand-mark {
        display: flex;
        align-items: end;
        width: 24px;
        height: 24px;
        gap: 2px;
        padding: 5px;
        border-radius: 7px;
        background: var(--ink);
    }

    .brand-mark i {
        display: block;
        width: 3px;
        border-radius: 3px;
        background: white;
    }

    .brand-mark i:nth-child(1) { height: 5px; opacity: 0.55; }
    .brand-mark i:nth-child(2) { height: 12px; }
    .brand-mark i:nth-child(3) { height: 8px; opacity: 0.75; }

    nav,
    .sidebar-foot {
        display: grid;
        gap: 3px;
    }

    nav a,
    .sidebar-foot a {
        display: flex;
        align-items: center;
        gap: 9px;
        min-height: 35px;
        padding: 0 9px;
        border-radius: 7px;
        color: #657188;
        font-size: 10.5px;
        font-weight: 620;
        text-decoration: none;
        transition: background 160ms ease, color 160ms ease;
    }

    nav a:hover,
    .sidebar-foot a:hover {
        color: var(--ink);
        background: #edf2f9;
    }

    nav a.active {
        color: #174eb9;
        background: #e8f0ff;
        box-shadow: inset 0 0 0 1px #d6e3ff;
    }

    .sidebar-foot {
        margin-top: auto;
    }

    .storage-note {
        margin-top: 9px;
        padding: 10px;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: white;
    }

    .storage-note span {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 9px;
        font-weight: 700;
    }

    .storage-note i,
    .live-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--mint);
        box-shadow: 0 0 0 3px rgba(25, 169, 116, 0.12);
    }

    .storage-note small {
        display: block;
        margin-top: 5px;
        color: var(--muted);
        font-size: 8.5px;
    }

    main {
        min-width: 0;
    }

    .topbar {
        position: sticky;
        z-index: 10;
        top: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 72px;
        padding: 11px clamp(18px, 3vw, 34px);
        border-bottom: 1px solid var(--line);
        background: rgba(244, 247, 251, 0.88);
        backdrop-filter: blur(18px);
    }

    .topbar p {
        margin: 0 0 3px;
        color: var(--muted);
        font-size: 8.5px;
        font-weight: 700;
        letter-spacing: 0.07em;
        text-transform: uppercase;
    }

    h1 {
        margin: 0;
        font-size: 16px;
        line-height: 1.2;
        letter-spacing: -0.035em;
        text-transform: capitalize;
    }

    .controls,
    .interval-control {
        display: flex;
        align-items: center;
        gap: 7px;
    }

    form,
    label {
        display: flex;
    }

    label,
    .refresh {
        min-height: 32px;
        border: 1px solid #d5deea;
        border-radius: 7px;
        background: white;
        box-shadow: 0 1px 1px rgba(18, 27, 43, 0.03);
    }

    .interval-control {
        padding-left: 9px;
        color: var(--muted);
    }

    select {
        min-width: 112px;
        border: 0;
        padding: 0 27px 0 10px;
        color: #344158;
        background: transparent;
        font-size: 10px;
        font-weight: 650;
        outline: 0;
        text-transform: capitalize;
    }

    .interval-control select {
        min-width: 90px;
        padding-left: 0;
    }

    .refresh {
        display: grid;
        width: 32px;
        place-items: center;
        color: var(--muted);
    }

    .content {
        width: min(1240px, 100%);
        margin: 0 auto;
        padding: 20px clamp(18px, 3vw, 34px) 30px;
    }

    .signal-rail {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 40px;
        margin-bottom: 13px;
        padding: 8px 12px;
        border: 1px solid #cfdef8;
        border-radius: 8px;
        background: linear-gradient(90deg, #f1f6ff, #f9fbff 70%);
    }

    .signal-copy,
    .signal-meta,
    .legend,
    footer span {
        display: flex;
        align-items: center;
    }

    .signal-copy {
        min-width: 0;
        gap: 8px;
        font-size: 9.5px;
    }

    .signal-copy strong {
        white-space: nowrap;
    }

    .signal-copy > span:last-child {
        overflow: hidden;
        color: var(--muted);
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .signal-meta {
        gap: 12px;
        color: #6d7b92;
        font-size: 8px;
        white-space: nowrap;
    }

    .signal-meta span {
        color: #176e51;
        font-weight: 700;
    }

    .metrics {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
    }

    .traffic-card {
        margin-top: 10px;
        padding: 0 14px 10px;
        border: 1px solid var(--line);
        border-radius: 11px;
        background: var(--panel);
        box-shadow: 0 1px 2px rgba(18, 27, 43, 0.04);
    }

    .section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 63px;
        border-bottom: 1px solid #edf1f6;
    }

    .section-head span {
        color: var(--muted);
        font-size: 8.5px;
        font-weight: 700;
        letter-spacing: 0.07em;
        text-transform: uppercase;
    }

    .section-head h2 {
        margin: 3px 0 0;
        font-size: 12px;
    }

    .legend {
        gap: 14px;
    }

    .legend span {
        gap: 5px;
        letter-spacing: 0;
        text-transform: none;
    }

    .legend i {
        width: 7px;
        height: 7px;
        border-radius: 2px;
        background: var(--blue);
    }

    .legend i.visitors {
        background: var(--mint);
    }

    .breakdown-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        margin-top: 10px;
        scroll-margin-top: 85px;
    }

    .breakdown-grid.three {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 2px 0;
        color: var(--muted);
        font-size: 8.5px;
    }

    footer span {
        gap: 6px;
    }

    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        clip-path: inset(50%);
    }

    @media (max-width: 920px) {
        .shell { grid-template-columns: 64px minmax(0, 1fr); }
        aside { padding-inline: 9px; }
        .brand { justify-content: center; padding-inline: 0; }
        .brand > span:last-child,
        nav a:not(.active)::after,
        nav a,
        .sidebar-foot a { font-size: 0; }
        nav a,
        .sidebar-foot a { justify-content: center; padding: 0; }
        .storage-note { display: none; }
        .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .breakdown-grid.three { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 640px) {
        .shell { display: block; }
        aside { display: none; }
        .topbar { align-items: flex-start; gap: 10px; padding: 12px 14px; }
        .controls { gap: 5px; }
        select { min-width: 82px; max-width: 100px; }
        .interval-control { display: none; }
        .content { padding: 14px; }
        .signal-meta { display: none; }
        .metrics,
        .breakdown-grid,
        .breakdown-grid.three { grid-template-columns: 1fr; }
        .section-head { align-items: flex-start; padding: 12px 0; }
        .legend { display: none; }
    }
</style>

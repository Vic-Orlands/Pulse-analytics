<script lang="ts">
    import { onMount } from "svelte";
    import { animate, stagger } from "motion";
    import ArrowDown from "phosphor-svelte/lib/ArrowDown";
    import ChartLine from "phosphor-svelte/lib/ChartLine";
    import Eye from "phosphor-svelte/lib/Eye";
    import Users from "phosphor-svelte/lib/Users";
    import X from "phosphor-svelte/lib/X";
    import type { PageProps } from "./$types";
    import TrafficChart from "$lib/components/TrafficChart.svelte";
    import AppShell from "$lib/components/AppShell.svelte";
    import InstallationSheet from "$lib/components/InstallationSheet.svelte";
    import DimensionPanel from "$lib/components/DimensionPanel.svelte";
    import type { CountRow } from "$lib/types";
    import { appearance } from "$lib/appearance.svelte";

    type FilterKey = "pages" | "referrers" | "countries" | "devices" | "os" | "browsers";

    let { data }: PageProps = $props();
    let chartMode = $state<"bar" | "area">("area");
    let installationOpen = $state(false);
    let filters = $state<Partial<Record<FilterKey, string>>>({});

    const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
    const formatNumber = (value: number) => compact.format(value);
    const formatPercent = (value: number) => `${value.toFixed(1)}%`;
    const periodLabel = $derived(
        data.interval === "today"
            ? "today"
            : data.interval === "yesterday"
                ? "yesterday"
                : `last ${data.interval.replace("d", " days")}`,
    );
    const conversion = $derived(data.funnel[data.funnel.length - 1]?.rate ?? 0);
    const growth = $derived(
        data.stats.previousVisitors > 0
            ? ((data.stats.visitors - data.stats.previousVisitors) / data.stats.previousVisitors) * 100
            : 0,
    );
    const growthLabel = $derived(
        data.stats.previousVisitors > 0 ? `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%` : "—",
    );
    const copyRows = $derived<CountRow[]>(data.copies.map((row) => [row.snippet, row.count]));
    const journeyRows = $derived<CountRow[]>(data.journeys.map((row) => [row.path, row.count]));
    const chips = $derived(
        (
            [
                ["pages", "Page", filters.pages],
                ["referrers", "Referrer", filters.referrers],
                ["countries", "Country", filters.countries],
                ["devices", "Device", filters.devices],
                ["os", "OS", filters.os],
                ["browsers", "Browser", filters.browsers],
            ] as const
        ).filter((chip) => Boolean(chip[2])),
    );

    function toggleFilter(key: FilterKey, label: string) {
        const next = { ...filters };
        if (next[key] === label) delete next[key];
        else next[key] = label;
        filters = next;
    }

    function clearFilter(key: FilterKey) {
        const next = { ...filters };
        delete next[key];
        filters = next;
    }

    function reveal() {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        animate("[data-reveal]", { opacity: [0, 1], y: [8, 0] }, { duration: 0.28, delay: stagger(0.02), ease: [0.22, 1, 0.36, 1] });
    }

    function closeInstallation() {
        installationOpen = false;
        window.setTimeout(() => document.getElementById("installation-trigger")?.focus(), 20);
    }

    onMount(reveal);
</script>

<svelte:head>
    <title>Pulse — Dashboard</title>
    <meta name="description" content="Private web analytics." />
</svelte:head>

<AppShell
    current="dashboard"
    siteId={data.siteId}
    sites={data.sites}
    interval={data.interval}
    title="Dashboard"
    oninstall={() => (installationOpen = true)}
>
    <div class="stack" class:dimmed={installationOpen} inert={installationOpen ? true : undefined}>
        {#if data.warnings.length || !data.sites.length || data.alerts.length}
            <section class="notices" data-reveal>
                {#if data.source === "demo"}
                    <p class="banner">Sample data.</p>
                {/if}
                {#each data.warnings.filter((warning) => data.source !== "demo") as warning (warning)}
                    <p class="banner warn">{warning}</p>
                {/each}
                {#if !data.sites.length}
                    <p class="banner">No apps yet.</p>
                {/if}
                {#each data.alerts as alert (alert.id)}
                    <article class="alert" data-severity={alert.severity}>
                        <span>{alert.severity}</span>
                        <div>
                            <strong>{alert.title}</strong>
                            <p>{alert.detail}</p>
                        </div>
                        <b>{alert.count}</b>
                    </article>
                {/each}
            </section>
        {/if}

        <section class="panel totals" aria-label="Core metrics" data-reveal>
            <article>
                <span class="kicker"><Users size={14} weight="fill" />Visitors</span>
                <strong>{formatNumber(data.stats.visitors)}</strong>
                <small><b class:up={growth >= 0} class:down={growth < 0}>{growthLabel}</b> vs previous · {periodLabel}</small>
            </article>
            <article>
                <span class="kicker"><Eye size={14} weight="fill" />Views</span>
                <strong>{formatNumber(data.stats.views)}</strong>
                <small>{data.stats.pagesPerVisit.toFixed(2)} pages per visit</small>
            </article>
            <article>
                <span class="kicker"><ChartLine size={14} weight="fill" />Sessions</span>
                <strong>{formatNumber(data.stats.sessions)}</strong>
                <small>{formatNumber(data.live.visitors)} live now</small>
            </article>
            <article>
                <span class="kicker"><ArrowDown size={14} weight="fill" />Bounce</span>
                <strong>{formatPercent(data.stats.bounceRate)}</strong>
                <small>{conversion.toFixed(0)}% converted</small>
            </article>
        </section>

        <section class="panel chart-panel" data-reveal>
            <header class="section-head">
                <div>
                    <span class="kicker">Traffic</span>
                    <h2>Visitors over time</h2>
                </div>
                <div class="chart-tools">
                    <div class="segmented" aria-label="Chart style">
                        <button class:active={chartMode === "bar"} aria-pressed={chartMode === "bar"} onclick={() => (chartMode = "bar")}>Bar</button>
                        <button class:active={chartMode === "area"} aria-pressed={chartMode === "area"} onclick={() => (chartMode = "area")}>Area</button>
                    </div>
                </div>
            </header>
            <TrafficChart data={data.series} theme={appearance.id} mode={chartMode} />
        </section>

        {#if chips.length}
            <div class="chips">
                {#each chips as [key, name, value] (key)}
                    <button type="button" onclick={() => clearFilter(key)}>
                        <span>{name}</span>
                        <strong>{value}</strong>
                        <X size={12} weight="fill" />
                    </button>
                {/each}
                <p>Filtered.</p>
            </div>
        {/if}

        <section class="breakdowns" aria-label="Audience breakdown" data-reveal>
            <div class="breakdown-top">
                <DimensionPanel
                    groups={[
                        { id: "pages", label: "Pages", rows: data.pages, empty: "No pages" },
                        { id: "routes", label: "Routes", rows: data.routes, empty: "No routes" },
                        { id: "hostnames", label: "Hostnames", rows: data.hostnames, empty: "No hostnames" },
                    ]}
                    selected={filters.pages ?? ""}
                    onselect={(label) => toggleFilter("pages", label)}
                />
                <DimensionPanel
                    groups={[
                        { id: "referrers", label: "Referrers", rows: data.referrers, empty: "No referrers" },
                        { id: "source", label: "UTM", rows: data.utmSources, empty: "No UTM" },
                    ]}
                    marker="referrer"
                    selected={filters.referrers ?? ""}
                    onselect={(label) => toggleFilter("referrers", label)}
                />
            </div>
            <div class="breakdown-bottom">
                <DimensionPanel
                    groups={[
                        { id: "countries", label: "Countries", rows: data.countries, empty: "No countries" },
                        { id: "regions", label: "Regions", rows: data.regions, empty: "No regions" },
                    ]}
                    marker="country"
                    format="percent"
                    selected={filters.countries ?? ""}
                    onselect={(label) => toggleFilter("countries", label)}
                />
                <DimensionPanel
                    groups={[
                        { id: "devices", label: "Devices", rows: data.devices, empty: "No devices", marker: "device" },
                        { id: "browsers", label: "Browsers", rows: data.browsers, empty: "No browsers", marker: "browser" },
                    ]}
                    format="percent"
                    selected={filters.devices ?? filters.browsers ?? ""}
                    onselect={(label, groupId) => toggleFilter(groupId === "browsers" ? "browsers" : "devices", label)}
                />
                <DimensionPanel
                    groups={[
                        { id: "os", label: "OS", rows: data.operatingSystems, empty: "No OS data" },
                    ]}
                    marker="os"
                    format="percent"
                    selected={filters.os ?? ""}
                    onselect={(label) => toggleFilter("os", label)}
                />
            </div>
        </section>

        <section class="breakdowns" aria-label="Session paths" data-reveal>
            <div class="breakdown-top">
                <DimensionPanel
                    groups={[{ id: "entries", label: "Entry pages", rows: data.entries, empty: "No landing pages" }]}
                />
                <DimensionPanel
                    groups={[{ id: "exits", label: "Exit pages", rows: data.exits, empty: "No exit pages" }]}
                />
            </div>
            <div class="breakdown-bottom">
                <DimensionPanel
                    groups={[
                        { id: "source", label: "UTM source", rows: data.utmSources, empty: "No UTM source" },
                        { id: "medium", label: "Medium", rows: data.utmMediums, empty: "No medium" },
                        { id: "campaign", label: "Campaign", rows: data.utmCampaigns, empty: "No campaign" },
                    ]}
                />
                <DimensionPanel
                    groups={[{ id: "bounce", label: "Bounce by landing", rows: data.bounceByLanding, empty: "No bounce data" }]}
                />
                <DimensionPanel
                    groups={[{ id: "journeys", label: "Journeys", rows: journeyRows, empty: "No journeys" }]}
                    preview={6}
                />
            </div>
        </section>

        <section class="breakdown-bottom" aria-label="Actions" data-reveal>
            <DimensionPanel
                groups={[{ id: "copies", label: "Copied text", rows: copyRows, empty: "No copied text" }]}
            />
            <DimensionPanel
                groups={[{ id: "outbound", label: "Outbound clicks", rows: data.outbound, empty: "No outbound clicks" }]}
                marker="referrer"
            />
            <DimensionPanel
                groups={[{ id: "downloads", label: "Downloads", rows: data.downloads, empty: "No downloads" }]}
            />
        </section>

        <section class="panel funnel" data-reveal>
            <header class="section-head"><div><span class="kicker">Funnel</span><h2>Funnel</h2></div></header>
            <div class="funnel-steps">
                {#each data.funnel as step, index (step.label)}
                    <article>
                        <span class="kicker">{String(index + 1).padStart(2, "0")}</span>
                        <h3>{step.label}</h3>
                        <strong>{formatNumber(step.count)}</strong>
                        <small>{step.rate.toFixed(0)}% of sessions</small>
                        <i style={`--share:${Math.max(8, step.rate)}%`}></i>
                    </article>
                {/each}
            </div>
        </section>
    </div>
</AppShell>
<InstallationSheet open={installationOpen} onclose={closeInstallation} />

<style>
    .dimmed { opacity: 0.46; transition: opacity 220ms ease; }
    .notices { display: grid; gap: 10px; }
    .banner, .alert { margin: 0; padding: 14px 16px; border: 1px solid var(--line); border-radius: 8px; background: var(--panel); font-size: 13px; line-height: 1.5; }
    .banner.warn, .alert[data-severity="warning"], .alert[data-severity="critical"] { border-color: color-mix(in srgb, var(--accent) 35%, var(--line)); }
    .alert { display: grid; grid-template-columns: auto 1fr auto; gap: 8px 14px; align-items: start; }
    .alert span, .alert b { color: var(--accent); font-size: 11px; text-transform: uppercase; }
    .alert p { margin: 4px 0 0; color: var(--muted); }
    .totals { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .totals article { min-width: 0; padding: 18px 20px 16px; }
    .totals article + article { border-left: 1px solid var(--line); }
    .totals .kicker { color: var(--muted); }
    .totals .kicker :global(svg) { color: var(--accent); }
    .totals strong { display: block; margin: 8px 0 6px; font-size: var(--text-lg); font-weight: 500; line-height: 1.3; letter-spacing: -0.02em; }
    .totals small { color: var(--muted); font-size: 12px; }
    .totals .up { color: var(--ok); }
    .totals .down { color: var(--accent); }
    .chart-panel, .funnel { padding: 22px 22px 16px; }
    .section-head { display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
    .section-head h2, .funnel-steps h3 { margin: 4px 0 0; font-size: var(--text-lg); font-weight: 500; letter-spacing: -0.02em; }
    .chart-tools { display: flex; max-width: 420px; align-items: center; gap: 14px; }
    .chips { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
    .chips button {
        display: inline-flex;
        min-height: 32px;
        align-items: center;
        gap: 8px;
        padding: 0 10px;
        border: 1px solid var(--line);
        border-radius: 999px;
        color: inherit;
        background: var(--panel);
        font-size: 12px;
        cursor: pointer;
    }
    .chips span { color: var(--muted); }
    .chips p { margin: 0; color: var(--muted); font-size: 12px; }
    .breakdowns { display: grid; gap: 12px; }
    .breakdown-top, .breakdown-bottom { display: grid; gap: 12px; }
    .breakdown-top { grid-template-columns: 1fr 1fr; }
    .breakdown-bottom { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .funnel-steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .funnel-steps article { position: relative; min-height: 150px; padding: 8px 18px 22px; overflow: hidden; }
    .funnel-steps article + article { border-left: 1px solid var(--line); }
    .funnel-steps small { color: var(--muted); font-size: 12px; }
    .funnel-steps strong { font-variant-numeric: tabular-nums; }
    .funnel-steps i { position: absolute; bottom: 0; left: 0; width: var(--share); height: 3px; background: var(--accent); }
    [data-reveal] { opacity: 0; }
    @media (max-width: 1100px) {
        .breakdown-bottom { grid-template-columns: 1fr 1fr; }
        .totals, .funnel-steps { grid-template-columns: 1fr 1fr; }
        .totals article:nth-child(n + 3) { border-top: 1px solid var(--line); }
        .totals article:nth-child(odd) { border-left: 0; }
        .funnel-steps article + article { border-left: 0; border-top: 1px solid var(--line); }
    }
    @media (max-width: 720px) {
        .totals, .breakdown-top, .breakdown-bottom, .funnel-steps { grid-template-columns: 1fr; }
        .totals article + article, .funnel-steps article + article { border-left: 0; border-top: 1px solid var(--line); }
        .section-head { align-items: start; flex-direction: column; }
        .chart-tools { width: 100%; max-width: none; }
    }
    @media (prefers-reduced-motion: reduce) {
        [data-reveal] { opacity: 1; }
        .dimmed { transition: none; }
    }
</style>

<script lang="ts">
    import { onMount } from "svelte";
    import { animate, stagger } from "motion";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        Activity01Icon,
        ArrowDown02Icon,
        BrowserIcon,
        ChromeIcon,
        ComputerIcon,
        ComputerTerminal01Icon,
        Globe02Icon,
        LaptopIcon,
        Location01Icon,
        SafariIcon,
        SmartPhone01Icon,
        UserGroupIcon,
        ViewIcon,
    } from "@hugeicons/core-free-icons";
    import type { PageProps } from "./$types";
    import TrafficChart from "$lib/components/TrafficChart.svelte";
    import AppShell from "$lib/components/AppShell.svelte";
    import InstallationSheet from "$lib/components/InstallationSheet.svelte";
    import SurfaceList from "$lib/components/SurfaceList.svelte";
    import { appearance } from "$lib/appearance.svelte";

    let { data }: PageProps = $props();
    let chartMode = $state<"bar" | "area">("area");
    let geography = $state<"countries" | "regions">("countries");
    let visitorView = $state<"pages" | "routes" | "hostnames">("pages");
    let browserView = $state<"browsers" | "versions">("browsers");
    let installationOpen = $state(false);
    let campaignView = $state<"source" | "medium" | "campaign">("source");

    const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
    const formatNumber = (value: number) => compact.format(value);
    const formatPercent = (value: number) => `${value.toFixed(1)}%`;
    const periodLabel = $derived(
        data.interval === "today" ? "today" : data.interval === "yesterday" ? "yesterday" : `the last ${data.interval}`,
    );
    const visitorRows = $derived(visitorView === "pages" ? data.pages : visitorView === "routes" ? data.routes : data.hostnames);
    const geographyRows = $derived(geography === "countries" ? data.countries : data.regions);
    const browserRows = $derived(browserView === "browsers" ? data.browsers : data.browserVersions);
    const campaignRows = $derived(campaignView === "source" ? data.utmSources : campaignView === "medium" ? data.utmMediums : data.utmCampaigns);
    const conversion = $derived(data.funnel[data.funnel.length - 1]?.rate ?? 0);
    const growth = $derived(
        data.stats.previousVisitors > 0
            ? ((data.stats.visitors - data.stats.previousVisitors) / data.stats.previousVisitors) * 100
            : 0,
    );
    const growthLabel = $derived(
        data.stats.previousVisitors > 0 ? `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%` : "—",
    );
    const totalDevices = $derived(Math.max(data.devices.reduce((sum, item) => sum + item[1], 0), 1));
    const signalCount = $derived(data.events.reduce((sum, event) => sum + event.count, 0));

    function browserIcon(name: string) {
        const value = name.toLowerCase();
        if (value.includes("chrome")) return ChromeIcon;
        if (value.includes("safari")) return SafariIcon;
        return BrowserIcon;
    }

    function operatingSystemIcon(name: string) {
        const value = name.toLowerCase();
        if (value.includes("mac")) return LaptopIcon;
        if (value.includes("ios") || value.includes("android")) return SmartPhone01Icon;
        if (value.includes("linux")) return ComputerTerminal01Icon;
        return ComputerIcon;
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
    <title>Pulse — Analytics</title>
    <meta name="description" content="Private web analytics for every product you ship." />
</svelte:head>

<AppShell
    current="dashboard"
    siteId={data.siteId}
    sites={data.sites}
    interval={data.interval}
    title="Analytics"
    oninstall={() => (installationOpen = true)}
>
    <div class="stack" class:dimmed={installationOpen} inert={installationOpen ? true : undefined}>
        {#if data.warnings.length || !data.sites.length || data.alerts.length}
            <section class="notices" data-reveal>
                {#if data.source === "demo"}
                    <p class="banner">Sample data is loaded for local preview. Live traffic appears after Cloudflare Analytics Engine is connected.</p>
                {/if}
                {#each data.warnings.filter((warning) => data.source !== "demo" || !warning.startsWith("Showing sample")) as warning (warning)}
                    <p class="banner warn">{warning}</p>
                {/each}
                {#if !data.sites.length}
                    <p class="banner">No applications yet. Open Install tracking, paste the snippet into any app, and Pulse will create it from the first pageview.</p>
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

        <section class="hero panel" data-reveal>
            <div>
                <p class="kicker">Audience · {periodLabel}</p>
                <p class="hero-value serif">{data.stats.visitors.toLocaleString()} <span>visitors</span></p>
                <p class="hero-copy">{data.siteId || "Your first app"} recorded {formatNumber(data.stats.views)} page views across {data.series.length} {data.interval === "today" ? "hours" : "days"}.</p>
            </div>
            <div class="hero-delta">
                <span class="kicker">vs previous window</span>
                <strong class:up={growth >= 0} class:down={growth < 0}>{growthLabel}</strong>
            </div>
        </section>

        <section class="metric-grid" aria-label="Core metrics" data-reveal>
            <article class="panel metric">
                <span class="kicker"><HugeiconsIcon icon={UserGroupIcon} size={15} strokeWidth={1.7} />Unique visitors</span>
                <strong class="serif">{formatNumber(data.stats.visitors)}</strong>
                <small><b>{growthLabel}</b> vs previous period</small>
            </article>
            <article class="panel metric">
                <span class="kicker"><HugeiconsIcon icon={ViewIcon} size={15} strokeWidth={1.7} />Page views</span>
                <strong class="serif">{formatNumber(data.stats.views)}</strong>
                <small>{data.stats.pagesPerVisit.toFixed(2)} pages per visit</small>
            </article>
            <article class="panel metric">
                <span class="kicker"><HugeiconsIcon icon={Activity01Icon} size={15} strokeWidth={1.7} />Sessions</span>
                <strong class="serif">{formatNumber(data.stats.sessions)}</strong>
                <small>30-minute inactivity window</small>
            </article>
            <article class="panel metric">
                <span class="kicker"><HugeiconsIcon icon={ArrowDown02Icon} size={15} strokeWidth={1.7} />Bounce rate</span>
                <strong class="serif">{formatPercent(data.stats.bounceRate)}</strong>
                <small>{formatNumber(data.stats.bounces)} single-page visits</small>
            </article>
        </section>

        <section class="insight-grid" aria-label="Live audience" data-reveal>
            <div class="panel insight">
                <span class="kicker"><i class="live-dot"></i>Live now</span>
                <strong class="serif">{formatNumber(data.live.visitors)}</strong>
                <small>People in the last 5 minutes</small>
            </div>
            <div class="panel insight">
                <span class="kicker">New visitors</span>
                <strong class="serif">{formatNumber(data.cohorts.newVisitors)}</strong>
                <small>First seen this window</small>
            </div>
            <div class="panel insight">
                <span class="kicker">Returning</span>
                <strong class="serif">{formatNumber(data.cohorts.returningVisitors)}</strong>
                <small>Seen before this window</small>
            </div>
            <div class="panel insight">
                <span class="kicker">Converted</span>
                <strong class="serif">{conversion.toFixed(0)}%</strong>
                <small>Copied, clicked out, or downloaded</small>
            </div>
        </section>

        <section class="panel chart-panel" data-reveal>
            <header class="section-head">
                <div>
                    <span class="kicker">Traffic</span>
                    <h2>Visitors over time</h2>
                </div>
                <div class="chart-tools">
                    <p>Current window measured against the preceding period.</p>
                    <div class="segmented" aria-label="Chart style">
                        <button class:active={chartMode === "bar"} aria-pressed={chartMode === "bar"} onclick={() => (chartMode = "bar")}>Bar</button>
                        <button class:active={chartMode === "area"} aria-pressed={chartMode === "area"} onclick={() => (chartMode = "area")}>Area</button>
                    </div>
                </div>
            </header>
            <TrafficChart data={data.series} theme={appearance.id} mode={chartMode} />
        </section>

        <section data-reveal>
            <header class="section-head">
                <div>
                    <span class="kicker"><HugeiconsIcon icon={Globe02Icon} size={14} strokeWidth={1.7} />Geography</span>
                    <h2>Where people visit from</h2>
                </div>
                <div class="segmented" aria-label="Geography dimension">
                    <button class:active={geography === "countries"} aria-pressed={geography === "countries"} onclick={() => (geography = "countries")}>Countries</button>
                    <button class:active={geography === "regions"} aria-pressed={geography === "regions"} onclick={() => (geography = "regions")}>Regions</button>
                </div>
            </header>
            <div class="geo-split">
                <div class="geo-grid panel">
                    {#each geographyRows.slice(0, 4) as row (row[0])}
                        <article>
                            <span class="kicker"><HugeiconsIcon icon={geography === "countries" ? Globe02Icon : Location01Icon} size={14} strokeWidth={1.7} />{row[0]}</span>
                            <strong class="serif">{formatNumber(row[1])}</strong>
                            <small>visitors</small>
                            <i style={`--share:${Math.max(12, (row[1] / Math.max(geographyRows[0]?.[1] ?? 1, 1)) * 100)}%`}></i>
                        </article>
                    {:else}
                        <p class="empty-copy">Geography appears as traffic arrives.</p>
                    {/each}
                </div>
                <div class="panel ranked">
                    {#each geographyRows.slice(4, 12) as row (row[0])}
                        <p><span>{row[0]}</span><strong>{formatNumber(row[1])}</strong></p>
                    {:else}
                        <p class="empty-copy">More regions appear as traffic spreads.</p>
                    {/each}
                </div>
            </div>
        </section>

        <section class="split-2" data-reveal>
            <article>
                <header class="section-head">
                    <div>
                        <span class="kicker">Content</span>
                        <h2>Top surfaces</h2>
                    </div>
                    <div class="segmented" aria-label="Visitor path dimension">
                        <button class:active={visitorView === "pages"} aria-pressed={visitorView === "pages"} onclick={() => (visitorView = "pages")}>Pages</button>
                        <button class:active={visitorView === "routes"} aria-pressed={visitorView === "routes"} onclick={() => (visitorView = "routes")}>Routes</button>
                        <button class:active={visitorView === "hostnames"} aria-pressed={visitorView === "hostnames"} onclick={() => (visitorView = "hostnames")}>Hosts</button>
                    </div>
                </header>
                <SurfaceList rows={visitorRows} empty={visitorView === "pages" ? "No entry pages in this period." : visitorView === "routes" ? "No route patterns in this period." : "No hostnames in this period."} />
            </article>
            <article>
                <header class="section-head">
                    <div>
                        <span class="kicker">Acquisition</span>
                        <h2>Referrers</h2>
                    </div>
                </header>
                <SurfaceList rows={data.referrers} empty="No referring sources in this period. Direct visits will appear as Direct." />
            </article>
        </section>

        <section class="split-3" data-reveal>
            <article>
                <header class="section-head"><div><span class="kicker">Devices</span><h2>Form factor</h2></div></header>
                <div class="device-meter" aria-label="Device share">
                    {#each data.devices as row, index (row[0])}<i class={`device-${index}`} style={`--share:${(row[1] / totalDevices) * 100}%`} title={`${row[0]}: ${row[1]}`}></i>{/each}
                </div>
                <div class="panel ranked">
                    {#each data.devices.slice(0, 4) as row, index (row[0])}<p><span><i class={`device-${index}`}></i>{row[0]}</span><strong>{formatNumber(row[1])}</strong></p>{/each}
                </div>
            </article>
            <article>
                <header class="section-head"><div><span class="kicker"><HugeiconsIcon icon={ComputerIcon} size={14} strokeWidth={1.7} />Systems</span><h2>Operating systems</h2></div></header>
                <div class="panel ranked">
                    {#each data.operatingSystems.slice(0, 5) as row (row[0])}
                        <p><span><HugeiconsIcon icon={operatingSystemIcon(row[0])} size={16} strokeWidth={1.6} />{row[0]}</span><strong>{formatNumber(row[1])}</strong></p>
                    {/each}
                </div>
            </article>
            <article>
                <header class="section-head">
                    <div><span class="kicker"><HugeiconsIcon icon={BrowserIcon} size={14} strokeWidth={1.7} />Clients</span><h2>Browsers</h2></div>
                    <div class="segmented" aria-label="Browser detail">
                        <button class:active={browserView === "browsers"} aria-pressed={browserView === "browsers"} onclick={() => (browserView = "browsers")}>Family</button>
                        <button class:active={browserView === "versions"} aria-pressed={browserView === "versions"} onclick={() => (browserView = "versions")}>Version</button>
                    </div>
                </header>
                <div class="panel ranked">
                    {#each browserRows.slice(0, 5) as row (row[0])}
                        <p><span><HugeiconsIcon icon={browserIcon(row[0])} size={16} strokeWidth={1.6} />{row[0]}</span><strong>{formatNumber(row[1])}</strong></p>
                    {/each}
                </div>
            </article>
        </section>

        <section class="split-2" data-reveal>
            <article>
                <header class="section-head"><div><span class="kicker">Sessions</span><h2>Entry pages</h2></div></header>
                <SurfaceList rows={data.entries} empty="No landing pages in this period." />
            </article>
            <article>
                <header class="section-head"><div><span class="kicker">Sessions</span><h2>Exit pages</h2></div></header>
                <SurfaceList rows={data.exits} empty="No exit pages in this period." />
            </article>
        </section>

        <section data-reveal>
            <header class="section-head"><div><span class="kicker">Paths</span><h2>Session journeys</h2></div></header>
            <div class="panel ranked">
                {#each data.journeys as journey (journey.path)}
                    <p><span>{journey.path}</span><strong>{formatNumber(journey.count)}</strong></p>
                {:else}
                    <p class="empty-copy">Journeys appear after sessions include a page path.</p>
                {/each}
            </div>
        </section>

        <section class="split-2" data-reveal>
            <article>
                <header class="section-head">
                    <div><span class="kicker">Campaigns</span><h2>UTM attribution</h2></div>
                    <div class="segmented" aria-label="Campaign dimension">
                        <button class:active={campaignView === "source"} aria-pressed={campaignView === "source"} onclick={() => (campaignView = "source")}>Source</button>
                        <button class:active={campaignView === "medium"} aria-pressed={campaignView === "medium"} onclick={() => (campaignView = "medium")}>Medium</button>
                        <button class:active={campaignView === "campaign"} aria-pressed={campaignView === "campaign"} onclick={() => (campaignView = "campaign")}>Campaign</button>
                    </div>
                </header>
                <SurfaceList rows={campaignRows} empty="No UTM parameters in this period." />
            </article>
            <article>
                <header class="section-head"><div><span class="kicker">Quality</span><h2>Bounce by landing</h2></div></header>
                <SurfaceList rows={data.bounceByLanding} empty="No bounce-by-landing data in this period." />
            </article>
        </section>

        <section class="split-3" data-reveal>
            <article>
                <header class="section-head"><div><span class="kicker">Copy</span><h2>Most copied text</h2></div></header>
                <div class="panel ranked">
                    {#each data.copies as row (row.snippet)}
                        <p><span title={row.snippet}>{row.snippet}<small> {row.path}</small></span><strong>{formatNumber(row.count)}</strong></p>
                    {:else}
                        <p class="empty-copy">Copied snippets appear after visitors copy text.</p>
                    {/each}
                </div>
            </article>
            <article>
                <header class="section-head"><div><span class="kicker">Leaves</span><h2>Outbound clicks</h2></div></header>
                <SurfaceList rows={data.outbound} empty="No outbound clicks in this period." />
            </article>
            <article>
                <header class="section-head"><div><span class="kicker">Files</span><h2>Downloads</h2></div></header>
                <SurfaceList rows={data.downloads} empty="No file downloads in this period." />
            </article>
        </section>

        <section class="panel funnel" data-reveal>
            <header class="section-head"><div><span class="kicker">Funnel</span><h2>Landed to action</h2></div></header>
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

        <a class="panel ledger-callout" href={`/signals?site=${data.siteId}&interval=${data.interval}`} data-reveal>
            <div>
                <span class="kicker">Event intelligence</span>
                <h2>Open the signal ledger</h2>
                <p>Review screenshot captures, copy actions, scraping detections, and the interactions around them.</p>
            </div>
            <strong>{signalCount} signals <span aria-hidden="true">↗</span></strong>
        </a>
    </div>
</AppShell>
<InstallationSheet open={installationOpen} onclose={closeInstallation} />

<style>
    .dimmed { opacity: 0.46; transition: opacity 220ms ease; }
    .notices { display: grid; gap: 10px; }
    .banner, .alert { margin: 0; padding: 14px 16px; border: 1px solid var(--line); border-radius: 14px; background: var(--panel); font-size: 13px; line-height: 1.5; }
    .banner.warn, .alert[data-severity="warning"], .alert[data-severity="critical"] { border-color: color-mix(in srgb, var(--accent) 35%, var(--line)); }
    .alert { display: grid; grid-template-columns: auto 1fr auto; gap: 8px 14px; align-items: start; }
    .alert span, .alert b { color: var(--accent); font-family: "IBM Plex Mono", monospace; font-size: 11px; text-transform: uppercase; }
    .alert p { margin: 4px 0 0; color: var(--muted); }
    .hero { display: flex; align-items: end; justify-content: space-between; gap: 24px; padding: 24px; }
    .hero-value { margin: 10px 0 8px; font-size: clamp(40px, 5vw, 64px); line-height: 0.92; letter-spacing: -0.05em; }
    .hero-value span { color: var(--muted); font-size: 0.42em; letter-spacing: -0.03em; }
    .hero-copy { max-width: 520px; margin: 0; color: var(--muted); }
    .hero-delta { display: grid; gap: 8px; justify-items: end; }
    .hero-delta strong { font-size: 28px; letter-spacing: -0.04em; }
    .hero-delta .up { color: var(--ok); }
    .hero-delta .down { color: var(--accent); }
    .metric, .insight { padding: 18px 18px 16px; }
    .metric .kicker, .insight .kicker { display: flex; align-items: center; gap: 8px; color: var(--muted); }
    .metric .kicker :global(svg), .section-head .kicker :global(svg) { color: var(--accent); }
    .metric strong, .insight strong { display: block; margin: 14px 0 8px; font-size: clamp(28px, 3vw, 36px); line-height: 1; letter-spacing: -0.04em; }
    .metric small, .insight small { color: var(--muted); font-size: 12px; }
    .metric small b { color: var(--accent); font-weight: 650; }
    .chart-panel, .funnel { padding: 22px 22px 16px; }
    .section-head { display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
    .section-head h2, .ledger-callout h2, .funnel-steps h3 { margin: 6px 0 0; font-size: 22px; font-weight: 650; letter-spacing: -0.03em; }
    .chart-tools { display: flex; max-width: 420px; align-items: center; gap: 14px; }
    .chart-tools p { margin: 0; color: var(--muted); font-size: 13px; }
    .geo-split { display: grid; grid-template-columns: 1.7fr 0.8fr; gap: 16px; }
    .geo-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .geo-grid article { position: relative; min-height: 148px; padding: 18px; overflow: hidden; }
    .geo-grid article + article { border-left: 1px solid var(--line); }
    .geo-grid strong { display: block; margin: 28px 0 4px; font-size: 28px; }
    .geo-grid small, .funnel-steps small { color: var(--muted); font-size: 12px; }
    .geo-grid article > i, .funnel-steps i { position: absolute; bottom: 0; left: 0; width: var(--share); height: 3px; background: var(--accent); }
    .ranked p { display: flex; min-height: 48px; align-items: center; justify-content: space-between; gap: 12px; margin: 0; padding: 0 16px; border-bottom: 1px solid var(--line); font-size: 13px; }
    .ranked p:last-child { border: 0; }
    .ranked p > span { display: flex; min-width: 0; align-items: center; gap: 8px; overflow: hidden; }
    .ranked p > span small { color: var(--muted); }
    .ranked strong { font-family: "IBM Plex Mono", monospace; font-size: 12px; }
    .ranked p > span i { width: 8px; height: 8px; border-radius: 99px; }
    .device-meter { display: flex; height: 10px; margin-bottom: 14px; overflow: hidden; border-radius: 99px; background: color-mix(in srgb, var(--ink) 6%, transparent); }
    .device-meter > i { width: var(--share); }
    .device-0 { background: var(--accent); }
    .device-1 { background: var(--comparison); }
    .device-2 { background: color-mix(in srgb, var(--accent) 45%, var(--comparison)); }
    .device-3 { background: var(--muted); }
    .funnel-steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .funnel-steps article { position: relative; min-height: 150px; padding: 8px 18px 22px; overflow: hidden; }
    .funnel-steps article + article { border-left: 1px solid var(--line); }
    .funnel-steps strong { font-family: "IBM Plex Mono", monospace; }
    .ledger-callout { display: flex; align-items: end; justify-content: space-between; gap: 24px; padding: 24px; color: inherit; text-decoration: none; }
    .ledger-callout p { max-width: 520px; margin: 8px 0 0; color: var(--muted); }
    .ledger-callout strong { font-family: "IBM Plex Mono", monospace; font-size: 12px; text-transform: uppercase; }
    .ledger-callout strong span { color: var(--accent); }
    .ledger-callout:hover { background: color-mix(in srgb, var(--accent) 6%, var(--panel)); }
    [data-reveal] { opacity: 0; }
    @media (max-width: 980px) {
        .geo-split, .funnel-steps { grid-template-columns: 1fr; }
        .geo-grid { grid-template-columns: 1fr 1fr; }
        .geo-grid article + article, .funnel-steps article + article { border-left: 0; border-top: 1px solid var(--line); }
        .hero { align-items: start; flex-direction: column; }
        .hero-delta { justify-items: start; }
        .section-head { align-items: start; flex-direction: column; }
        .chart-tools { width: 100%; max-width: none; }
    }
    @media (prefers-reduced-motion: reduce) {
        [data-reveal] { opacity: 1; }
        .dimmed { transition: none; }
    }
</style>

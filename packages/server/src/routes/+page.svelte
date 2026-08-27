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
    import ThemeChooser from "$lib/components/ThemeChooser.svelte";
    import TrafficChart from "$lib/components/TrafficChart.svelte";
    import AppRail from "$lib/components/AppRail.svelte";
    import InstallationSheet from "$lib/components/InstallationSheet.svelte";
    import SurfaceList from "$lib/components/SurfaceList.svelte";
    import { applyTheme, defaultTheme, readTheme, saveTheme, type ThemeId } from "$lib/theme";

    let { data }: PageProps = $props();
    let theme = $state<ThemeId>(defaultTheme);
    let choosing = $state(false);
    let chartMode = $state<"bar" | "area">("area");
    let geography = $state<"countries" | "regions">("countries");
    let visitorView = $state<"pages" | "routes" | "hostnames">("pages");
    let browserView = $state<"browsers" | "versions">("browsers");
    let installationOpen = $state(false);
    let campaignView = $state<"source" | "medium" | "campaign">("source");

    const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
    const formatNumber = (value: number) => compact.format(value);
    const formatPercent = (value: number) => `${value.toFixed(1)}%`;
    const periodLabel = $derived(data.interval === "today" ? "Today" : data.interval.toUpperCase());
    const visitorRows = $derived(visitorView === "pages" ? data.pages : visitorView === "routes" ? data.routes : data.hostnames);
    const geographyRows = $derived(geography === "countries" ? data.countries : data.regions);
    const browserRows = $derived(browserView === "browsers" ? data.browsers : data.browserVersions);
    const campaignRows = $derived(campaignView === "source" ? data.utmSources : campaignView === "medium" ? data.utmMediums : data.utmCampaigns);
    const conversion = $derived(data.funnel[data.funnel.length - 1]?.rate ?? 0);
    const growth = $derived(data.stats.previousVisitors > 0 ? ((data.stats.visitors - data.stats.previousVisitors) / data.stats.previousVisitors) * 100 : 0);
    const totalDevices = $derived(Math.max(data.devices.reduce((sum, item) => sum + item[1], 0), 1));

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
        animate("[data-reveal]", { opacity: [0, 1], y: [7, 0] }, { duration: 0.32, delay: stagger(0.022), ease: [0.22, 1, 0.36, 1] });
    }

    function chooseTheme(value: ThemeId) {
        theme = value;
        saveTheme(value);
        choosing = false;
        window.requestAnimationFrame(reveal);
    }

    function toggleTheme() {
        chooseTheme(theme === "signal" ? "observatory" : "signal");
    }

    function closeInstallation() {
        installationOpen = false;
        window.setTimeout(() => document.getElementById("installation-trigger")?.focus(), 20);
    }

    onMount(() => {
        const preference = readTheme();
        theme = preference ?? defaultTheme;
        applyTheme(theme);
        choosing = preference === null;
        if (!choosing) reveal();
    });
</script>

<svelte:head>
    <title>Pulse — Counterscale</title>
    <meta name="description" content="Private web analytics with editorial clarity." />
</svelte:head>

{#if choosing}
    <main class="welcome"><ThemeChooser selected={theme} onselect={chooseTheme} /></main>
{:else}
    <div class="dashboard text-xs [&_small]:!text-xs [&_dt]:!text-xs [&_p]:!text-xs [&_.kicker]:!text-xs [&_.journal-meta]:!text-xs [&_.utility-head]:!text-xs [&_.column-label]:!text-xs [&_.segmented_button]:!text-xs [&_.geography-grid_span]:!text-xs [&_.geography-grid_strong]:!text-xs [&_.simple-list]:!text-xs [&_.simple-list_strong]:!text-xs" data-theme={theme}>
        <AppRail {theme} current="dashboard" ontheme={toggleTheme} oninstall={() => (installationOpen = true)} />
        <div class="app-stage" class:sheet-open={installationOpen} inert={installationOpen ? true : undefined}>
            <header class="masthead">
                <div class="nav-frame">
                    <a class="brand" href="/" aria-label="Pulse analytics home">
                        <span class="mark" aria-hidden="true"><i></i><i></i><i></i></span>
                        <span>Pulse</span>
                    </a>
                    <form class="site-form" method="GET">
                        <input type="hidden" name="interval" value={data.interval} />
                        <label><span class="sr-only">Application</span>
                            <select name="site" value={data.siteId} onchange={(event) => event.currentTarget.form?.requestSubmit()}>
                                {#if data.sites.length}
                                    {#each data.sites as site}<option value={site}>{site}</option>{/each}
                                {:else}
                                    <option value="">Install tracking to create an app</option>
                                {/if}
                            </select>
                        </label>
                    </form>
                    <span class="page-title">Analytics</span>
                    <div class="periods" aria-label="Time period">
                        {#each ["7d", "14d", "30d"] as interval}
                            <a class:active={data.interval === interval} href={`/?site=${data.siteId}&interval=${interval}`}>{interval.toUpperCase()}</a>
                        {/each}
                    </div>
                </div>
            </header>

            <main class="frame">
                <section class="journal-head" data-reveal>
                    <div class="journal-meta">
                        <span>[ Observatory Journal No. 42 ]</span>
                        <span>Property: {data.siteId} — Window: {periodLabel} ({data.series.length} days)</span>
                    </div>
                    {#if data.warnings.length}
                        <p class="query-warnings">{data.warnings.join(" · ")}</p>
                    {/if}
                    {#if !data.sites.length}
                        <p class="query-warnings">No applications yet. Open Install tracking, paste the sample snippet into any app, and Pulse will create the app from the first pageview.</p>
                    {/if}
                    {#if data.alerts.length}
                        <div class="alerts">
                            {#each data.alerts as alert}
                                <article data-severity={alert.severity}>
                                    <span>{alert.severity}</span>
                                    <strong>{alert.title}</strong>
                                    <p>{alert.detail}</p>
                                    <b>{alert.count}</b>
                                </article>
                            {/each}
                        </div>
                    {/if}
                    <h1>
                        {data.stats.visitors.toLocaleString()} individuals connected to {data.siteId}.
                        <em>Traffic expanded by {growth}%</em> over the baseline period.
                    </h1>
                </section>

                <section class="metric-section ruled-frame" aria-label="Core telemetry metrics" data-reveal>
                    <header class="utility-head"><span>[ Core Telemetry Metrics ]</span><span>Audience &amp; engagement index</span></header>
                    <dl>
                        <div>
                            <dt><HugeiconsIcon icon={UserGroupIcon} size={15} strokeWidth={1.6} />Unique visitors</dt>
                            <dd>{formatNumber(data.stats.visitors)}</dd>
                            <small><b>+{growth}%</b> vs previous period</small>
                        </div>
                        <div>
                            <dt><HugeiconsIcon icon={ViewIcon} size={15} strokeWidth={1.6} />Total page views</dt>
                            <dd>{formatNumber(data.stats.views)}</dd>
                            <small>{data.stats.pagesPerVisit.toFixed(2)} pages per visit</small>
                        </div>
                        <div>
                            <dt><HugeiconsIcon icon={Activity01Icon} size={15} strokeWidth={1.6} />User sessions</dt>
                            <dd>{formatNumber(data.stats.sessions)}</dd>
                            <small>30-minute inactivity window</small>
                        </div>
                        <div>
                            <dt><HugeiconsIcon icon={ArrowDown02Icon} size={15} strokeWidth={1.6} />Bounce rate</dt>
                            <dd>{formatPercent(data.stats.bounceRate)}</dd>
                            <small>{formatNumber(data.stats.bounces)} single-page visits</small>
                        </div>
                    </dl>
                </section>

                <section class="insight-strip ruled-frame" aria-label="Live audience and cohorts" data-reveal>
                    <div><span>Live now</span><strong>{formatNumber(data.live.visitors)}</strong><small>People in the last 5 minutes</small></div>
                    <div><span>New visitors</span><strong>{formatNumber(data.cohorts.newVisitors)}</strong><small>First seen this window</small></div>
                    <div><span>Returning</span><strong>{formatNumber(data.cohorts.returningVisitors)}</strong><small>Seen before this window</small></div>
                    <div><span>Converted</span><strong>{conversion.toFixed(0)}%</strong><small>Copied, clicked out, or downloaded</small></div>
                </section>

                <section class="chart-section ruled-frame" data-reveal>
                    <header class="section-head">
                        <div><span class="kicker">[ Daily Visitor Velocity — {chartMode === "bar" ? "Bar View" : "Area View"} ]</span><h2>Visitors over time</h2></div>
                        <div class="chart-tools">
                            <p>Current window measured against the preceding period.</p>
                            <div class="segmented" aria-label="Chart style">
                                <button class:active={chartMode === "bar"} aria-pressed={chartMode === "bar"} onclick={() => (chartMode = "bar")}>Bar</button>
                                <button class:active={chartMode === "area"} aria-pressed={chartMode === "area"} onclick={() => (chartMode = "area")}>Area</button>
                            </div>
                        </div>
                    </header>
                    <TrafficChart data={data.series} {theme} mode={chartMode} />
                    <div class="annotations">
                        <p><b>[01]</b> The strongest returning audience appeared near the middle of the period.</p>
                        <p><b>[02]</b> Page depth held at {data.stats.pagesPerVisit.toFixed(2)} views per session.</p>
                    </div>
                </section>

                <section class="content-section" data-reveal>
                    <header class="section-head compact-head">
                        <div><span class="kicker icon-kicker"><HugeiconsIcon icon={Globe02Icon} size={15} strokeWidth={1.6} />[ Geographic Distribution ]</span><h2>Regions &amp; countries</h2></div>
                        <div class="segmented" aria-label="Geography dimension">
                            <button class:active={geography === "countries"} aria-pressed={geography === "countries"} onclick={() => (geography = "countries")}><HugeiconsIcon icon={Globe02Icon} size={13} strokeWidth={1.6} />Countries</button>
                            <button class:active={geography === "regions"} aria-pressed={geography === "regions"} onclick={() => (geography = "regions")}><HugeiconsIcon icon={Location01Icon} size={13} strokeWidth={1.6} />Regions</button>
                        </div>
                    </header>
                    <div class="geo-split">
                    <div class="geography-grid ruled-frame">
                        {#each geographyRows.slice(0, 4) as row, index}
                            <article>
                                <span><HugeiconsIcon icon={geography === "countries" ? Globe02Icon : Location01Icon} size={15} strokeWidth={1.6} /><span class="sr-only">{String(index + 1).padStart(2, "0")}</span></span>
                                <h3>{row[0]}</h3>
                                <div><strong>{formatNumber(row[1])}</strong><small>visitors</small></div>
                                <i style={`--share:${Math.max(12, (row[1] / Math.max(geographyRows[0]?.[1] ?? 1, 1)) * 100)}%`}></i>
                            </article>
                        {/each}
                    </div>
                    <div class="simple-list ruled-frame">
                        {#each geographyRows.slice(4, 12) as row}
                            <p><span>{row[0]}</span><strong>{formatNumber(row[1])}</strong></p>
                        {:else}
                            <p><span>More regions appear as traffic spreads.</span><strong></strong></p>
                        {/each}
                    </div>
                    </div>
                </section>

                <section class="duet" data-reveal>
                    <article class="list-section">
                        <header class="section-head compact-head">
                            <div><span class="kicker">[ Top Entry Pages ]</span><h2>Content surfaces</h2></div>
                            <div class="segmented compact-tabs" aria-label="Visitor path dimension">
                                <button class:active={visitorView === "pages"} aria-pressed={visitorView === "pages"} onclick={() => (visitorView = "pages")}>Pages</button>
                                <button class:active={visitorView === "routes"} aria-pressed={visitorView === "routes"} onclick={() => (visitorView = "routes")}>Routes</button>
                                <button class:active={visitorView === "hostnames"} aria-pressed={visitorView === "hostnames"} onclick={() => (visitorView = "hostnames")}>Hosts</button>
                            </div>
                        </header>
                        <SurfaceList rows={visitorRows} empty={visitorView === "pages" ? "No entry pages in this period." : visitorView === "routes" ? "No route patterns in this period." : "No hostnames in this period."} />
                    </article>
                    <article class="list-section">
                        <header class="section-head compact-head"><div><span class="kicker">[ Top Referrers ]</span><h2>Referral ingress</h2></div><span class="column-label">Visitors / views</span></header>
                        <SurfaceList rows={data.referrers} empty="No referring sources in this period. Direct visits will appear as Direct." />
                    </article>
                </section>

                <section class="technology" data-reveal>
                    <article class="tech-section">
                        <header class="section-head compact-head"><div><span class="kicker">[ Device Category Share ]</span><h2>Devices</h2></div></header>
                        <div class="device-meter" aria-label="Device share">
                            {#each data.devices as row, index}<i class={`device-${index}`} style={`--share:${(row[1] / totalDevices) * 100}%`} title={`${row[0]}: ${row[1]}`}></i>{/each}
                        </div>
                        <div class="simple-list ruled-frame">
                            {#each data.devices.slice(0, 4) as row, index}<p><span><i class={`device-${index}`}></i>{row[0]}</span><strong>{formatNumber(row[1])}</strong></p>{/each}
                        </div>
                    </article>
                    <article class="tech-section">
                        <header class="section-head compact-head"><div><span class="kicker icon-kicker"><HugeiconsIcon icon={ComputerIcon} size={15} strokeWidth={1.6} />[ Operating Systems ]</span><h2>Systems</h2></div></header>
                        <div class="simple-list ruled-frame">{#each data.operatingSystems.slice(0, 5) as row}<p><span><HugeiconsIcon icon={operatingSystemIcon(row[0])} size={16} strokeWidth={1.6} />{row[0]}</span><strong>{formatNumber(row[1])}</strong></p>{/each}</div>
                    </article>
                    <article class="tech-section browser-section">
                        <header class="section-head compact-head">
                            <div><span class="kicker icon-kicker"><HugeiconsIcon icon={BrowserIcon} size={15} strokeWidth={1.6} />[ Browser Environment ]</span><h2>Browsers</h2></div>
                            <div class="segmented compact-tabs" aria-label="Browser detail"><button class:active={browserView === "browsers"} aria-pressed={browserView === "browsers"} onclick={() => (browserView = "browsers")}>Family</button><button class:active={browserView === "versions"} aria-pressed={browserView === "versions"} onclick={() => (browserView = "versions")}>Version</button></div>
                        </header>
                        <div class="simple-list ruled-frame">{#each browserRows.slice(0, 5) as row}<p><span><HugeiconsIcon icon={browserIcon(row[0])} size={16} strokeWidth={1.6} />{row[0]}</span><strong>{formatNumber(row[1])}</strong></p>{/each}</div>
                    </article>
                </section>

                <section class="duet" data-reveal>
                    <article class="list-section">
                        <header class="section-head compact-head"><div><span class="kicker">[ Entry Pages ]</span><h2>Where visits begin</h2></div><span class="column-label">Sessions</span></header>
                        <SurfaceList rows={data.entries} empty="No landing pages in this period." />
                    </article>
                    <article class="list-section">
                        <header class="section-head compact-head"><div><span class="kicker">[ Exit Pages ]</span><h2>Where visits end</h2></div><span class="column-label">Sessions</span></header>
                        <SurfaceList rows={data.exits} empty="No exit pages in this period." />
                    </article>
                </section>

                <section class="list-section journeys" data-reveal>
                    <header class="section-head compact-head"><div><span class="kicker">[ Session Journeys ]</span><h2>Ordered paths through the site</h2></div></header>
                    <div class="simple-list ruled-frame">
                        {#each data.journeys as journey}
                            <p><span>{journey.path}</span><strong>{formatNumber(journey.count)}</strong></p>
                        {:else}
                            <p><span>Journeys appear after sessions include a page path.</span><strong></strong></p>
                        {/each}
                    </div>
                </section>

                <section class="duet" data-reveal>
                    <article class="list-section">
                        <header class="section-head compact-head">
                            <div><span class="kicker">[ Campaign Board ]</span><h2>UTM attribution</h2></div>
                            <div class="segmented compact-tabs" aria-label="Campaign dimension">
                                <button class:active={campaignView === "source"} aria-pressed={campaignView === "source"} onclick={() => (campaignView = "source")}>Source</button>
                                <button class:active={campaignView === "medium"} aria-pressed={campaignView === "medium"} onclick={() => (campaignView = "medium")}>Medium</button>
                                <button class:active={campaignView === "campaign"} aria-pressed={campaignView === "campaign"} onclick={() => (campaignView = "campaign")}>Campaign</button>
                            </div>
                        </header>
                        <SurfaceList rows={campaignRows} empty="No UTM parameters in this period." />
                    </article>
                    <article class="list-section">
                        <header class="section-head compact-head"><div><span class="kicker">[ Bounce By Landing ]</span><h2>Single-page landings</h2></div><span class="column-label">Bounces / sessions</span></header>
                        <SurfaceList rows={data.bounceByLanding} empty="No bounce-by-landing data in this period." />
                    </article>
                </section>

                <section class="technology copies" data-reveal>
                    <article class="tech-section">
                        <header class="section-head compact-head"><div><span class="kicker">[ Copy Intelligence ]</span><h2>Most copied text</h2></div></header>
                        <div class="simple-list ruled-frame">
                            {#each data.copies as row}
                                <p><span title={row.snippet}>{row.snippet}<small> {row.path}</small></span><strong>{formatNumber(row.count)}</strong></p>
                            {:else}
                                <p><span>Copied snippets appear after visitors copy text.</span><strong></strong></p>
                            {/each}
                        </div>
                    </article>
                    <article class="tech-section">
                        <header class="section-head compact-head"><div><span class="kicker">[ Outbound Clicks ]</span><h2>Leaves</h2></div></header>
                        <SurfaceList rows={data.outbound} empty="No outbound clicks in this period." />
                    </article>
                    <article class="tech-section">
                        <header class="section-head compact-head"><div><span class="kicker">[ Downloads ]</span><h2>Files</h2></div></header>
                        <SurfaceList rows={data.downloads} empty="No file downloads in this period." />
                    </article>
                </section>

                <section class="funnel ruled-frame" data-reveal>
                    <header class="section-head compact-head"><div><span class="kicker">[ Conversion Funnel ]</span><h2>Landed to action</h2></div></header>
                    <div class="funnel-steps">
                        {#each data.funnel as step, index}
                            <article>
                                <span>{String(index + 1).padStart(2, "0")}</span>
                                <h3>{step.label}</h3>
                                <strong>{formatNumber(step.count)}</strong>
                                <small>{step.rate.toFixed(0)}% of sessions</small>
                                <i style={`--share:${Math.max(8, step.rate)}%`}></i>
                            </article>
                        {/each}
                    </div>
                </section>

                <a class="ledger-callout ruled-frame" href={`/signals?site=${data.siteId}&interval=${data.interval}`} data-reveal>
                    <div><span class="kicker">[ Event Intelligence ]</span><h2>Open the Signal Ledger</h2></div>
                    <p>Review screenshot captures, copy actions, scraping detections, and the interactions surrounding them.</p>
                    <strong>{data.events.reduce((sum, event) => sum + event.count, 0)} signals <span aria-hidden="true">↗</span></strong>
                </a>
            </main>
        </div>
        <InstallationSheet open={installationOpen} onclose={closeInstallation} />
    </div>
{/if}

<style>
    :global(*) { box-sizing: border-box; }
    .welcome { min-height: 100vh; background: #eae6dc; }
    .dashboard {
        --paper: #eae6dc; --panel: #f2eee4; --ink: #171715; --muted: #74745a; --line: rgba(23, 23, 21, .12); --accent: #7c2f35; --comparison: #a8a495;
        min-height: 100vh; color: var(--ink); background: var(--paper); font-family: "Plus Jakarta Sans Variable", system-ui, sans-serif; transition: color 180ms ease, background 180ms ease;
    }
    .dashboard[data-theme="signal"] { --paper: #111014; --panel: #19171d; --ink: #f0ece4; --muted: #9e969d; --line: rgba(240, 236, 228, .105); --accent: #ff6759; --comparison: #81c4cf; }
    .app-stage { min-height: 100vh; transform-origin: left center; transition: opacity 260ms ease-out, transform 260ms cubic-bezier(.22,1,.36,1); }
    .app-stage.sheet-open { opacity: .46; transform: scale(.97) translateX(-10px); }
    button, select { font: inherit; }
    button, a { -webkit-tap-highlight-color: transparent; }
    .frame, .nav-frame { width: min(1120px, calc(100% - 140px)); margin: 0 auto; }
    .masthead { position: sticky; z-index: 20; top: 0; box-shadow: 0 1px color-mix(in srgb, var(--ink) 8%, transparent); background: color-mix(in srgb, var(--paper) 91%, transparent); backdrop-filter: blur(14px); }
    .nav-frame { display: flex; min-height: 58px; align-items: center; gap: 22px; }
    .brand { display: inline-flex; align-items: center; gap: 9px; color: inherit; font-family: "Instrument Serif", Georgia, serif; font-size: 19px; text-decoration: none; white-space: nowrap; }
    .mark { display: flex; align-items: end; gap: 2px; width: 15px; height: 14px; }.mark i { width: 3px; height: 7px; background: var(--accent); }.mark i:nth-child(2) { height: 13px; }.mark i:nth-child(3) { height: 10px; }
    .site-form select { max-width: 150px; border: 0; padding: 4px 20px 4px 0; color: var(--muted); background: transparent; font-family: "IBM Plex Mono", monospace; font-size: 9px; text-transform: uppercase; cursor: pointer; }
    .page-title { margin-right: auto; color: var(--muted); font-family: "IBM Plex Mono", monospace; font-size: 8px; text-transform: uppercase; }
    .periods, .segmented { display: flex; align-items: center; box-shadow: 0 0 0 1px var(--line); }
    .periods a, .segmented button { display: inline-flex; min-width: 34px; align-items: center; justify-content: center; gap: 5px; padding: 7px 9px; border: 0; color: var(--muted); background: transparent; font-family: "IBM Plex Mono", monospace; font-size: 8px; text-align: center; text-decoration: none; text-transform: uppercase; cursor: pointer; transition: color 150ms ease, background 150ms ease; }
    .periods a + a, .segmented button + button { box-shadow: -1px 0 var(--line); }
    .periods a:hover, .segmented button:hover, .periods a.active, .segmented button.active { color: var(--paper); background: var(--ink); }
    .frame { padding: clamp(48px, 7vw, 82px) 0 70px; }
    h1, h2, h3, p { margin: 0; }
    h1, h2, h3 { font-family: "Instrument Serif", Georgia, serif; font-weight: 400; }
    h1 { max-width: 970px; margin-top: 18px; font-size: clamp(36px, 4.5vw, 54px); line-height: 1.08; letter-spacing: -.038em; text-wrap: balance; }
    h1 em { color: var(--accent); font-weight: 400; }
    h2 { font-size: clamp(26px, 2.8vw, 36px); line-height: 1; letter-spacing: -.03em; }
    .journal-head { margin-bottom: 54px; }
    .query-warnings { max-width: 720px; margin-top: 14px; color: var(--accent); font-family: "IBM Plex Mono", monospace; font-size: 8px; line-height: 1.55; }
    .journal-meta { display: flex; justify-content: space-between; gap: 30px; color: var(--muted); font-family: "IBM Plex Mono", monospace; font-size: 8px; letter-spacing: .06em; text-transform: uppercase; }
    .ruled-frame { position: relative; border-block: 1px solid var(--line); }
    .ruled-frame::before, .ruled-frame::after { position: absolute; z-index: 2; top: -8px; bottom: -8px; width: 1px; background: var(--line); content: ""; pointer-events: none; }
    .ruled-frame::before { left: 0; }.ruled-frame::after { right: 0; }
    .utility-head { display: flex; justify-content: space-between; padding: 14px 22px; box-shadow: 0 1px var(--line); color: var(--muted); font-family: "IBM Plex Mono", monospace; font-size: 8px; letter-spacing: .08em; text-transform: uppercase; }
    .metric-section { background: color-mix(in srgb, var(--panel) 52%, transparent); }
    .metric-section dl { display: grid; grid-template-columns: repeat(4, 1fr); margin: 0; }
    .metric-section dl > div { min-width: 0; padding: 25px 22px 27px; }.metric-section dl > div + div { box-shadow: -1px 0 var(--line); }
    dt { display: flex; align-items: center; gap: 7px; color: var(--muted); font-family: "IBM Plex Mono", monospace; font-size: 8px; text-transform: uppercase; }dt :global(svg) { color: var(--accent); }
    dd { margin: 12px 0 8px; font-family: "Instrument Serif", Georgia, serif; font-size: clamp(34px, 4vw, 46px); line-height: 1; font-variant-numeric: tabular-nums; }
    .metric-section small { color: var(--muted); font-size: 9px; }.metric-section small b { color: var(--accent); font-weight: 600; }
    .chart-section, .content-section, .duet, .technology, .ledger-callout, .journeys, .funnel, .insight-strip { margin-top: 58px; }
    .insight-strip { display: grid; grid-template-columns: repeat(4, 1fr); background: color-mix(in srgb, var(--panel) 42%, transparent); }
    .insight-strip > div { min-width: 0; padding: 18px 22px 20px; }
    .insight-strip > div + div { box-shadow: -1px 0 var(--line); }
    .insight-strip span { color: var(--muted); font-family: "IBM Plex Mono", monospace; font-size: 8px; text-transform: uppercase; }
    .insight-strip strong { display: block; margin: 10px 0 6px; font-family: "Instrument Serif", Georgia, serif; font-size: clamp(26px, 3vw, 36px); font-weight: 400; }
    .insight-strip small { color: var(--muted); font-size: 9px; }
    .alerts { display: grid; gap: 10px; max-width: 860px; margin-top: 18px; }
    .alerts article { display: grid; grid-template-columns: auto 1fr auto; gap: 8px 14px; padding: 12px 14px; box-shadow: 0 0 0 1px var(--line); }
    .alerts span, .alerts b { font-family: "IBM Plex Mono", monospace; font-size: 8px; text-transform: uppercase; color: var(--accent); }
    .alerts strong { font-size: 13px; }
    .alerts p { grid-column: 2; color: var(--muted); font-size: 10px; line-height: 1.5; }
    .geo-split { display: grid; grid-template-columns: 1.7fr .8fr; gap: 28px; }
    .funnel { padding: 22px 22px 8px; background: color-mix(in srgb, var(--panel) 36%, transparent); }
    .funnel-steps { display: grid; grid-template-columns: repeat(3, 1fr); }
    .funnel-steps article { position: relative; min-height: 150px; padding: 8px 18px 22px; overflow: hidden; }
    .funnel-steps article + article { box-shadow: -1px 0 var(--line); }
    .funnel-steps span { color: var(--muted); font-family: "IBM Plex Mono", monospace; font-size: 8px; }
    .funnel-steps h3 { margin: 22px 0 12px; font-size: 22px; }
    .funnel-steps strong { font-family: "IBM Plex Mono", monospace; font-size: 12px; }
    .funnel-steps small { display: block; margin-top: 6px; color: var(--muted); font-size: 8px; text-transform: uppercase; }
    .funnel-steps i { position: absolute; bottom: 0; left: 0; width: var(--share); height: 2px; background: var(--accent); }
    .copies .simple-list p > span { min-width: 0; overflow: hidden; }
    .copies .simple-list p > span small { color: var(--muted); font-size: 8px; text-transform: uppercase; }
    .journeys .simple-list p > span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .chart-section { padding: 28px 24px 20px; background: color-mix(in srgb, var(--panel) 42%, transparent); }
    .section-head { display: flex; align-items: end; justify-content: space-between; gap: 30px; margin-bottom: 28px; }
    .compact-head { margin-bottom: 20px; }
    .kicker, .column-label { display: flex; align-items: center; gap: 7px; margin-bottom: 9px; color: var(--muted); font-family: "IBM Plex Mono", monospace; font-size: 8px; letter-spacing: .07em; text-transform: uppercase; }
    .icon-kicker :global(svg) { color: var(--accent); }
    .column-label { margin: 0 2px 3px 0; }
    .chart-tools { display: flex; max-width: 420px; align-items: center; gap: 18px; }.chart-tools p { color: var(--muted); font-size: 9px; line-height: 1.55; text-wrap: pretty; }
    .annotations { display: grid; grid-template-columns: repeat(2, 1fr); gap: 28px; margin-top: 10px; padding-top: 17px; box-shadow: 0 -1px var(--line); }.annotations p { display: flex; gap: 10px; color: var(--muted); font-size: 9px; line-height: 1.55; }.annotations b { color: var(--accent); font-family: "IBM Plex Mono", monospace; }
    .geography-grid { display: grid; grid-template-columns: repeat(4, 1fr); background: color-mix(in srgb, var(--panel) 26%, transparent); }
    .geography-grid article { position: relative; min-height: 142px; padding: 18px; overflow: hidden; }.geography-grid article + article { box-shadow: -1px 0 var(--line); }.geography-grid article > span { color: var(--muted); font-family: "IBM Plex Mono", monospace; font-size: 8px; }
    .geography-grid h3 { margin: 28px 0 13px; font-size: 22px; }.geography-grid article div { display: flex; align-items: baseline; gap: 7px; }.geography-grid strong { font-family: "IBM Plex Mono", monospace; font-size: 10px; }.geography-grid small { color: var(--muted); font-size: 8px; text-transform: uppercase; }
    .geography-grid article > i { position: absolute; bottom: 0; left: 0; width: var(--share); height: 2px; background: var(--accent); transition: width 260ms ease-out; }
    .duet { display: grid; grid-template-columns: 1fr 1fr; gap: 58px; }.list-section, .tech-section { min-width: 0; }
    .technology { display: grid; grid-template-columns: .9fr .8fr 1.15fr; gap: 42px; }
    .device-meter { display: flex; height: 17px; margin-bottom: 22px; background: color-mix(in srgb, var(--ink) 5%, transparent); }.device-meter > i { width: var(--share); }.device-0 { background: var(--accent); }.device-1 { background: var(--comparison); }.device-2 { background: color-mix(in srgb, var(--accent) 45%, var(--comparison)); }.device-3 { background: var(--muted); }
    .simple-list p { display: flex; min-height: 43px; align-items: center; justify-content: space-between; gap: 14px; padding: 0 14px; box-shadow: 0 1px var(--line); font-size: 10px; }.simple-list p:last-child { box-shadow: none; }.simple-list p > span { display: flex; align-items: center; gap: 8px; }.simple-list p > span i { width: 6px; height: 6px; }.simple-list strong { font-family: "IBM Plex Mono", monospace; font-size: 9px; }
    .ledger-callout { display: grid; grid-template-columns: 1.1fr 1.35fr auto; align-items: end; gap: 34px; padding: 27px 22px; color: var(--ink); text-decoration: none; transition: background 180ms ease, transform 180ms ease; }.ledger-callout:hover { background: color-mix(in srgb, var(--accent) 5%, transparent); transform: translateY(-2px); }.ledger-callout p { color: var(--muted); font-size: 10px; line-height: 1.6; text-wrap: pretty; }.ledger-callout > strong { font-family: "IBM Plex Mono", monospace; font-size: 9px; text-transform: uppercase; }.ledger-callout > strong span { color: var(--accent); }
    [data-reveal] { opacity: 0; }
    :global(.sr-only) { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
    button:focus-visible, a:focus-visible, select:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
    @media (max-width: 980px) { .technology { grid-template-columns: 1fr 1fr; }.browser-section { grid-column: 1 / -1; }.ledger-callout { grid-template-columns: 1fr 1fr; }.ledger-callout > strong { grid-column: 2; }.geo-split { grid-template-columns: 1fr; } }
    @media (max-width: 700px) {
        .frame, .nav-frame { width: min(100% - 28px, 1120px); }.nav-frame { gap: 10px; min-height: 54px; }.site-form select { max-width: 100px; }.page-title { display: none; }.periods a { min-width: 31px; padding-inline: 6px; }
        .frame { padding-top: 38px; padding-bottom: 100px; }.journal-meta { align-items: start; flex-direction: column; gap: 8px; }.journal-head { margin-bottom: 44px; }
        .utility-head span:last-child { display: none; }.metric-section dl { grid-template-columns: 1fr 1fr; }.metric-section dl > div + div { box-shadow: -1px 0 var(--line); }.metric-section dl > div:nth-child(3) { box-shadow: 0 -1px var(--line); }.metric-section dl > div:nth-child(4) { box-shadow: -1px -1px var(--line); }
        .chart-section, .content-section, .duet, .technology, .ledger-callout, .journeys, .funnel, .insight-strip { margin-top: 48px; }.chart-section { padding: 22px 16px 18px; }.section-head { align-items: start; flex-direction: column; margin-bottom: 22px; }.chart-tools { width: 100%; max-width: none; }.chart-tools p { margin-right: auto; }
        .geography-grid { grid-template-columns: 1fr 1fr; }.geography-grid article:nth-child(3) { box-shadow: 0 -1px var(--line); }.geography-grid article:nth-child(4) { box-shadow: -1px -1px var(--line); }
        .duet, .technology, .geo-split, .funnel-steps, .insight-strip { grid-template-columns: 1fr; gap: 46px; }.insight-strip > div + div, .funnel-steps article + article { box-shadow: 0 -1px var(--line); }.browser-section { grid-column: auto; }.annotations { grid-template-columns: 1fr; }.ledger-callout { grid-template-columns: 1fr; align-items: start; }.ledger-callout > strong { grid-column: auto; }
    }
    @media (prefers-reduced-motion: reduce) { .dashboard, .app-stage, .ledger-callout, .geography-grid article > i { transition: none; } [data-reveal] { opacity: 1; } }
</style>

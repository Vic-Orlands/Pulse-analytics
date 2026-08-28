<script lang="ts">
    import ArrowUpRight from "phosphor-svelte/lib/ArrowUpRight";
    import Compass from "phosphor-svelte/lib/Compass";
    import Desktop from "phosphor-svelte/lib/Desktop";
    import DeviceMobile from "phosphor-svelte/lib/DeviceMobile";
    import DeviceTablet from "phosphor-svelte/lib/DeviceTablet";
    import DotsThree from "phosphor-svelte/lib/DotsThree";
    import DownloadSimple from "phosphor-svelte/lib/DownloadSimple";
    import Globe from "phosphor-svelte/lib/Globe";
    import GoogleChromeLogo from "phosphor-svelte/lib/GoogleChromeLogo";
    import Laptop from "phosphor-svelte/lib/Laptop";
    import Terminal from "phosphor-svelte/lib/Terminal";
    import X from "phosphor-svelte/lib/X";
    import type { CountRow } from "$lib/types";

    type PhosphorIcon = typeof DeviceMobile;

    type DimensionMarker = "none" | "referrer" | "country" | "device" | "os" | "browser";

    type DimensionGroup = {
        id: string;
        label: string;
        rows: CountRow[];
        empty: string;
        marker?: DimensionMarker;
        format?: "count" | "percent";
    };

    let {
        groups,
        valueLabel = "Visitors",
        preview = 8,
        marker = "none",
        format = "count",
        selected = "",
        onselect,
    }: {
        groups: DimensionGroup[];
        valueLabel?: string;
        preview?: number;
        marker?: DimensionMarker;
        format?: "count" | "percent";
        selected?: string;
        onselect?: (label: string, groupId: string) => void;
    } = $props();

    let chosenId = $state<string | null>(null);
    let allOpen = $state(false);
    let menuOpen = $state(false);
    let query = $state("");
    let dialogEl = $state<HTMLDivElement>();

    const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
    const active = $derived(groups.find((group) => group.id === chosenId) ?? groups[0]);
    const rows = $derived(active?.rows ?? []);
    const activeMarker = $derived(active?.marker ?? marker);
    const activeFormat = $derived(active?.format ?? format);
    const total = $derived(Math.max(rows.reduce((sum, row) => sum + row[1], 0), 1));
    const max = $derived(Math.max(...rows.map((row) => row[1]), 1));
    const visible = $derived(rows.slice(0, preview));
    const filtered = $derived.by(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return rows;
        return rows.filter((row) => (row[0] || "Direct").toLowerCase().includes(needle));
    });

    function formatValue(value: number) {
        if (activeFormat === "percent") return `${Math.round((value / total) * 100)}%`;
        return compact.format(value);
    }

    function share(value: number) {
        return Math.max(4, (value / max) * 100);
    }

    function displayLabel(label: string) {
        if (!label) return "Direct";
        if (activeMarker === "device") return label.charAt(0).toUpperCase() + label.slice(1);
        return label;
    }

    function toggleRow(label: string) {
        onselect?.(label || "Direct", active?.id ?? "");
    }

    function openAll() {
        menuOpen = false;
        query = "";
        allOpen = true;
    }

    function closeAll() {
        allOpen = false;
        query = "";
    }

    function exportCsv() {
        menuOpen = false;
        const header = ["Label", valueLabel, "Views"].join(",");
        const body = rows.map((row) =>
            [csvCell(displayLabel(row[0])), String(row[1]), String(row[2] ?? row[1])].join(","),
        );
        const blob = new Blob([[header, ...body].join("\n")], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${(active?.label ?? "dimension").toLowerCase().replace(/\s+/g, "-")}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }

    function csvCell(value: string) {
        if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
        return value;
    }

    function focusSearch(node: HTMLInputElement) {
        node.focus();
    }

    function handleKeydown(event: KeyboardEvent) {
        if (!allOpen) return;
        if (event.key === "Escape") closeAll();
        if (event.key !== "Tab") return;
        const focusable = Array.from(
            dialogEl?.querySelectorAll<HTMLElement>('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? [],
        ).filter((element) => !element.hasAttribute("disabled"));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
        }
    }

    function countryFlag(name: string) {
        const code = COUNTRY_CODES[name] ?? name.slice(0, 2).toUpperCase();
        return [...code].map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0))).join("");
    }

    function referrerMark(label: string) {
        const host = (label || "Direct").replace(/^https?:\/\//, "").split("/")[0] ?? "Direct";
        if (!host.includes(".") || host === "Direct") return host.slice(0, 1).toUpperCase();
        return host.replace(/^www\./, "").slice(0, 1).toUpperCase();
    }

    function deviceIcon(name: string): PhosphorIcon {
        const value = name.toLowerCase();
        if (value.includes("mobile")) return DeviceMobile;
        if (value.includes("tablet")) return DeviceTablet;
        return Desktop;
    }

    function osIcon(name: string): PhosphorIcon {
        const value = name.toLowerCase();
        if (value.includes("mac") || value.includes("ios")) return Laptop;
        if (value.includes("android")) return DeviceMobile;
        if (value.includes("linux")) return Terminal;
        return Desktop;
    }

    function browserIcon(name: string): PhosphorIcon {
        const value = name.toLowerCase();
        if (value.includes("chrome")) return GoogleChromeLogo;
        if (value.includes("safari")) return Compass;
        return Globe;
    }

    const COUNTRY_CODES: Record<string, string> = {
        Nigeria: "NG",
        "United States": "US",
        "United Kingdom": "GB",
        Germany: "DE",
        Canada: "CA",
        Netherlands: "NL",
        Ghana: "GH",
        France: "FR",
        India: "IN",
        Brazil: "BR",
        Australia: "AU",
        Japan: "JP",
        Kenya: "KE",
        "South Africa": "ZA",
        Spain: "ES",
        Italy: "IT",
        Sweden: "SE",
        Poland: "PL",
        Ireland: "IE",
        Singapore: "SG",
    };
</script>

<svelte:window
    onkeydown={handleKeydown}
    onclick={() => {
        menuOpen = false;
    }}
/>

<section class="panel dimension">
    <header>
        {#if groups.length > 1}
            <nav class="tabs" aria-label={valueLabel}>
                {#each groups as group (group.id)}
                    <button
                        type="button"
                        class:active={active?.id === group.id}
                        aria-pressed={active?.id === group.id}
                        onclick={() => (chosenId = group.id)}
                    >
                        {group.label}
                    </button>
                {/each}
            </nav>
        {:else}
            <h2>{active?.label ?? ""}</h2>
        {/if}
        <span class="kicker">{valueLabel}</span>
    </header>

    {#if visible.length === 0}
        <p class="empty-copy">{active?.empty ?? "No data"}</p>
    {:else}
        <ol>
            {#each visible as row (row[0])}
                {@const label = row[0] || "Direct"}
                <li>
                    <button
                        type="button"
                        class="row"
                        class:with-mark={activeMarker !== "none"}
                        class:selected={selected === label}
                        style={`--share:${share(row[1])}%`}
                        onclick={() => toggleRow(label)}
                    >
                        <i class="bar" aria-hidden="true"></i>
                        {#if activeMarker === "country"}
                            <span class="mark flag" aria-hidden="true">{countryFlag(label)}</span>
                        {:else if activeMarker === "referrer"}
                            <span class="mark glyph" aria-hidden="true">{referrerMark(label)}</span>
                        {:else if activeMarker === "device"}
                            {@const Device = deviceIcon(label)}
                            <span class="mark icon" aria-hidden="true"><Device size={14} weight="fill" /></span>
                        {:else if activeMarker === "os"}
                            {@const Os = osIcon(label)}
                            <span class="mark icon" aria-hidden="true"><Os size={14} weight="fill" /></span>
                        {:else if activeMarker === "browser"}
                            {@const Browser = browserIcon(label)}
                            <span class="mark icon" aria-hidden="true"><Browser size={14} weight="fill" /></span>
                        {/if}
                        <span class="label" title={displayLabel(label)}>{displayLabel(label)}</span>
                        <strong>{formatValue(row[1])}</strong>
                    </button>
                </li>
            {/each}
        </ol>
    {/if}

    <footer>
        <button type="button" class="ghost" onclick={openAll} disabled={rows.length === 0}>
            View all
            <ArrowUpRight size={13} weight="fill" />
        </button>
        <div class="more">
            <button
                type="button"
                class="ghost icon-only"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="More actions"
                onclick={(event) => {
                    event.stopPropagation();
                    menuOpen = !menuOpen;
                }}
            >
                <DotsThree size={15} weight="fill" />
            </button>
            {#if menuOpen}
                <div class="menu">
                    <button type="button" onclick={exportCsv} disabled={rows.length === 0}>
                        <DownloadSimple size={14} weight="fill" />
                        Export CSV
                    </button>
                </div>
            {/if}
        </div>
    </footer>
</section>

{#if allOpen}
    <button class="scrim" aria-label="Close {active?.label ?? 'list'}" onclick={closeAll}></button>
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="dimension-title" bind:this={dialogEl}>
        <header>
            <div>
                <span class="kicker">{valueLabel}</span>
                <h3 id="dimension-title">{active?.label ?? "All"}</h3>
            </div>
            <button type="button" class="ghost icon-only" onclick={closeAll} aria-label="Close list">
                <X size={16} weight="fill" />
            </button>
        </header>
        <input
            bind:value={query}
            type="search"
            use:focusSearch
            placeholder="Search {active?.label?.toLowerCase() ?? 'rows'}"
            aria-label="Search {active?.label ?? 'rows'}"
        />
        {#if filtered.length === 0}
            <p class="empty-copy">No matches.</p>
        {:else}
            <ol>
                {#each filtered as row (row[0])}
                    {@const label = row[0] || "Direct"}
                    <li>
                        <button
                            type="button"
                            class="row"
                            class:selected={selected === label}
                            style={`--share:${share(row[1])}%`}
                            onclick={() => {
                                toggleRow(label);
                                closeAll();
                            }}
                        >
                            <i class="bar" aria-hidden="true"></i>
                            <span class="label" title={displayLabel(label)}>{displayLabel(label)}</span>
                            <strong>{formatValue(row[1])}</strong>
                        </button>
                    </li>
                {/each}
            </ol>
        {/if}
    </div>
{/if}

<style>
    .dimension {
        display: grid;
        grid-template-rows: auto 1fr auto;
        min-height: 100%;
        border-radius: 8px;
        box-shadow: none;
    }

    header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 48px;
        padding: 8px 10px 8px 12px;
    }

    h2,
    h3 {
        margin: 0;
        font-size: 13px;
        font-weight: 500;
        letter-spacing: -0.02em;
    }

    .tabs {
        display: flex;
        min-width: 0;
        flex-wrap: wrap;
        gap: 2px;
    }

    .tabs button {
        min-height: 28px;
        padding: 0 9px;
        border: 0;
        border-radius: 8px;
        color: var(--muted);
        background: transparent;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
    }

    .tabs button.active,
    .tabs button:hover {
        color: var(--ink);
        background: color-mix(in srgb, var(--ink) 7%, transparent);
    }

    ol {
        margin: 0;
        padding: 0 8px 4px;
        list-style: none;
    }

    .row {
        position: relative;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        width: 100%;
        min-height: 36px;
        margin: 1px 0;
        padding: 0 8px 0 10px;
        overflow: hidden;
        border: 0;
        border-radius: 8px;
        color: inherit;
        background: transparent;
        text-align: left;
        cursor: pointer;
    }

    .row.with-mark {
        grid-template-columns: auto minmax(0, 1fr) auto;
    }

    .bar {
        position: absolute;
        inset: 2px auto 2px 0;
        width: var(--share);
        border-radius: 8px;
        background: color-mix(in srgb, var(--ink) 7%, transparent);
        pointer-events: none;
    }

    .row:hover .bar,
    .row.selected .bar {
        background: color-mix(in srgb, var(--accent) 16%, transparent);
    }

    .mark,
    .label,
    strong {
        position: relative;
        z-index: 1;
    }

    .mark {
        display: grid;
        width: 18px;
        height: 18px;
        margin-right: 8px;
        place-items: center;
        overflow: hidden;
        border-radius: 99px;
        background: color-mix(in srgb, var(--ink) 8%, transparent);
        font-size: 11px;
        font-weight: 500;
        line-height: 1;
    }

    .flag {
        background: transparent;
        font-size: 14px;
    }

    .label {
        overflow: hidden;
        font-size: 13px;
        font-weight: 500;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    strong {
        margin-left: 12px;
        color: var(--muted);
        font-size: 12px;
        font-weight: 500;
        font-variant-numeric: tabular-nums;
    }

    footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 10px 10px;
    }

    .ghost {
        display: inline-flex;
        min-height: 32px;
        align-items: center;
        gap: 6px;
        padding: 0 10px;
        border: 1px solid var(--line);
        border-radius: 8px;
        color: var(--ink);
        background: transparent;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
    }

    .ghost:hover:not(:disabled) {
        background: color-mix(in srgb, var(--ink) 5%, transparent);
    }

    .ghost:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }

    .icon-only {
        width: 32px;
        padding: 0;
        justify-content: center;
    }

    .more {
        position: relative;
    }

    .menu {
        position: absolute;
        right: 0;
        bottom: calc(100% + 6px);
        z-index: 4;
        min-width: 160px;
        padding: 4px;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: var(--panel);
        box-shadow: var(--shadow);
    }

    .menu button {
        display: flex;
        width: 100%;
        min-height: 34px;
        align-items: center;
        gap: 8px;
        padding: 0 10px;
        border: 0;
        border-radius: 7px;
        color: inherit;
        background: transparent;
        font-size: 13px;
        cursor: pointer;
    }

    .menu button:hover:not(:disabled) {
        background: color-mix(in srgb, var(--ink) 6%, transparent);
    }

    .scrim {
        position: fixed;
        inset: 0;
        z-index: 60;
        border: 0;
        background: color-mix(in srgb, var(--ink) 28%, transparent);
        cursor: default;
    }

    .sheet {
        position: fixed;
        top: 50%;
        left: 50%;
        z-index: 70;
        display: grid;
        grid-template-rows: auto auto minmax(0, 1fr);
        width: min(520px, calc(100vw - 32px));
        max-height: min(72vh, 640px);
        overflow: hidden;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: var(--panel);
        box-shadow: var(--shadow);
        transform: translate(-50%, -50%);
    }

    .sheet header {
        padding: 14px 14px 8px;
    }

    .sheet h3 {
        margin-top: 4px;
        font-size: var(--text-lg);
    }

    .sheet input {
        margin: 0 14px 8px;
        min-height: 36px;
        padding: 0 12px;
        border: 1px solid var(--line);
        border-radius: 8px;
        color: inherit;
        background: color-mix(in srgb, var(--paper) 70%, transparent);
    }

    .sheet ol {
        overflow: auto;
        padding: 4px 10px 12px;
    }
</style>

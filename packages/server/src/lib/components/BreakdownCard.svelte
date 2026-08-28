<script lang="ts">
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import type { IconSvgElement } from "@hugeicons/svelte";
    import type { CountRow } from "$lib/types";

    let {
        title,
        eyebrow,
        rows,
        icon,
        valueLabel = "Visitors",
    }: {
        title: string;
        eyebrow: string;
        rows: CountRow[];
        icon: IconSvgElement;
        valueLabel?: string;
    } = $props();

    const max = $derived(Math.max(...rows.map((row) => row[1]), 1));
</script>

<section class="panel">
    <header>
        <div class="title-mark">
            <span class="icon"><HugeiconsIcon {icon} size={15} strokeWidth={1.7} /></span>
            <div>
                <span class="kicker">{eyebrow}</span>
                <h2>{title}</h2>
            </div>
        </div>
        <span class="kicker">{valueLabel}</span>
    </header>

    <div class="rows">
        {#if rows.length === 0}
            <div class="empty-copy">No traffic</div>
        {:else}
            {#each rows.slice(0, 6) as row, index}
                <div class="row">
                    <span class="rank">{String(index + 1).padStart(2, "0")}</span>
                    <div class="label-wrap">
                        <span class="label" title={row[0] || "Direct"}>{row[0] || "Direct"}</span>
                        <span class="bar" style={`--width: ${(row[1] / max) * 100}%`}></span>
                    </div>
                    <strong>{row[1].toLocaleString()}</strong>
                </div>
            {/each}
        {/if}
    </div>
</section>

<style>
    header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 66px;
        padding: 12px 16px;
        border-bottom: 1px solid var(--line);
    }

    .title-mark { display: flex; align-items: center; gap: 10px; }
    .icon {
        display: grid;
        width: 32px;
        height: 32px;
        place-items: center;
        border: 1px solid var(--line);
        border-radius: 10px;
        color: var(--accent);
        background: color-mix(in srgb, var(--accent) 8%, var(--paper));
    }

    h2 { margin: 4px 0 0; font-size: 16px; font-weight: 500; }
    .rows { padding: 6px 16px 10px; }
    .row {
        display: grid;
        grid-template-columns: 28px minmax(0, 1fr) auto;
        align-items: center;
        min-height: 46px;
        gap: 8px;
        border-bottom: 1px solid var(--line);
    }
    .row:last-child { border-bottom: 0; }
    .rank { color: var(--muted); font-size: 11px; font-variant-numeric: tabular-nums; }
    .label-wrap { min-width: 0; }
    .label { display: block; overflow: hidden; font-size: 13px; font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
    .bar { display: block; width: var(--width); height: 3px; margin-top: 6px; border-radius: 99px; background: var(--accent); }
    strong { font-size: 12px; font-weight: 500; font-variant-numeric: tabular-nums; }
</style>

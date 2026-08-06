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

<section class="card" data-reveal>
    <header>
        <div class="title-mark">
            <span class="icon"><HugeiconsIcon {icon} size={15} strokeWidth={1.7} /></span>
            <div>
                <span>{eyebrow}</span>
                <h2>{title}</h2>
            </div>
        </div>
        <span class="column-label">{valueLabel}</span>
    </header>

    <div class="rows">
        {#if rows.length === 0}
            <div class="empty">No traffic recorded for this period.</div>
        {:else}
            {#each rows.slice(0, 6) as row, index}
                <div class="row">
                    <span class="rank mono">{String(index + 1).padStart(2, "0")}</span>
                    <div class="label-wrap">
                        <span class="label" title={row[0] || "Direct"}>{row[0] || "Direct"}</span>
                        <span class="bar" style={`--width: ${(row[1] / max) * 100}%`}></span>
                    </div>
                    <strong class="mono">{row[1].toLocaleString()}</strong>
                </div>
            {/each}
        {/if}
    </div>
</section>

<style>
    .card {
        min-width: 0;
        overflow: hidden;
        border: 1px solid var(--line);
        border-radius: 11px;
        background: var(--panel);
        box-shadow: 0 1px 2px rgba(18, 27, 43, 0.04);
    }

    header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 66px;
        padding: 12px 14px;
        border-bottom: 1px solid var(--line);
    }

    .title-mark {
        display: flex;
        align-items: center;
        gap: 9px;
    }

    .icon {
        display: grid;
        width: 29px;
        height: 29px;
        place-items: center;
        border: 1px solid #d7e2f3;
        border-radius: 7px;
        color: var(--blue);
        background: #f4f8ff;
    }

    header span,
    .column-label {
        color: var(--muted);
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    h2 {
        margin: 2px 0 0;
        font-size: 12px;
        line-height: 1.2;
    }

    .rows {
        padding: 5px 14px 8px;
    }

    .row {
        display: grid;
        grid-template-columns: 26px minmax(0, 1fr) auto;
        align-items: center;
        min-height: 43px;
        gap: 7px;
        border-bottom: 1px solid #edf1f6;
    }

    .row:last-child {
        border-bottom: 0;
    }

    .rank {
        color: #9ba6b7;
        font-size: 9px;
    }

    .label-wrap {
        min-width: 0;
    }

    .label {
        display: block;
        overflow: hidden;
        color: #2c374a;
        font-size: 10.5px;
        font-weight: 600;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .bar {
        display: block;
        width: var(--width);
        height: 2px;
        margin-top: 5px;
        border-radius: 99px;
        background: linear-gradient(90deg, var(--blue), #87acff);
    }

    strong {
        color: #344158;
        font-size: 10px;
        font-weight: 500;
    }

    .empty {
        padding: 28px 4px;
        color: var(--muted);
        font-size: 10px;
        text-align: center;
    }
</style>

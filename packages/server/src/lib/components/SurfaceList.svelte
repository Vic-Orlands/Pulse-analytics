<script lang="ts">
    import type { CountRow } from "$lib/types";

    let {
        rows,
        empty,
    }: {
        rows: CountRow[];
        empty: string;
    } = $props();

    const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
    const max = $derived(Math.max(...rows.map((row) => row[1]), 1));

    function formatNumber(value: number) {
        return compact.format(value);
    }
</script>

<div class="surface-list panel">
    {#each rows.slice(0, 8) as row, index (row[0])}
        {@const views = row[2] ?? row[1]}
        {@const share = Math.max(8, (row[1] / max) * 100)}
        <article class="surface-row">
            <span class="rank">{String(index + 1).padStart(2, "0")}</span>
            <div class="body">
                <p title={row[0]}>{row[0]}</p>
                <i style={`--share:${share}%`}></i>
            </div>
            <div class="metrics">
                <strong>{formatNumber(row[1])}</strong>
                <small>{formatNumber(views)} views</small>
            </div>
        </article>
    {:else}
        <p class="empty-copy">{empty}</p>
    {/each}
</div>

<style>
    .surface-row {
        display: grid;
        grid-template-columns: 28px minmax(0, 1fr) auto;
        align-items: center;
        gap: 12px;
        min-height: 58px;
        padding: 10px 16px;
        border-bottom: 1px solid var(--line);
    }

    .surface-row:last-child { border-bottom: 0; }

    .rank {
        color: var(--muted);
        font-variant-numeric: tabular-nums;
        font-size: 11px;
    }

    .body { min-width: 0; }

    .body p {
        overflow: hidden;
        margin: 0 0 8px;
        font-size: 13.5px;
        font-weight: 600;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .body i {
        display: block;
        width: var(--share);
        height: 3px;
        border-radius: 99px;
        background: var(--accent);
    }

    .metrics {
        display: grid;
        justify-items: end;
        gap: 3px;
    }

    .metrics strong {
        font-variant-numeric: tabular-nums;
        font-size: 13px;
    }

    .metrics small {
        color: var(--muted);
        font-variant-numeric: tabular-nums;
        font-size: 11px;
    }
</style>

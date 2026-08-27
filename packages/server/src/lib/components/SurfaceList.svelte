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

<div class="surface-list ruled-frame">
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
        <p class="empty">{empty}</p>
    {/each}
</div>

<style>
    .surface-list { min-width: 0; background: color-mix(in srgb, var(--panel) 34%, transparent); }
    .surface-row { display: grid; grid-template-columns: 28px minmax(0, 1fr) auto; align-items: center; gap: 12px; min-height: 58px; padding: 10px 16px; box-shadow: 0 1px var(--line); }
    .surface-row:last-child { box-shadow: none; }
    .rank { color: var(--muted); font-family: "IBM Plex Mono", monospace; font-size: 8px; }
    .body { min-width: 0; }
    .body p { overflow: hidden; margin: 0 0 8px; font-size: 12px; font-weight: 550; text-overflow: ellipsis; white-space: nowrap; }
    .body i { display: block; width: var(--share); height: 2px; background: var(--accent); transition: width 260ms ease-out; }
    .metrics { display: grid; justify-items: end; gap: 3px; }
    .metrics strong { font-family: "IBM Plex Mono", monospace; font-size: 11px; }
    .metrics small { color: var(--muted); font-family: "IBM Plex Mono", monospace; font-size: 7px; text-transform: uppercase; }
    .empty { margin: 0; padding: 28px 16px; color: var(--muted); font-size: 10px; }
    @media (prefers-reduced-motion: reduce) { .body i { transition: none; } }
</style>

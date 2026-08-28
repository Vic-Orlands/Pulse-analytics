<script lang="ts">
    import type { CountRow } from "$lib/types";

    let {
        title,
        eyebrow,
        rows,
    }: {
        title: string;
        eyebrow: string;
        rows: CountRow[];
    } = $props();

    const max = $derived(Math.max(...rows.map((row) => row[1]), 1));
</script>

<section class="panel ranking">
    <header>
        <div>
            <span class="kicker">{eyebrow}</span>
            <h2>{title}</h2>
        </div>
        <span class="kicker">Visitors</span>
    </header>

    {#if rows.length === 0}
        <p class="empty-copy">No traffic</p>
    {:else}
        <ol>
            {#each rows.slice(0, 6) as row, index}
                <li>
                    <span class="rank">{String(index + 1).padStart(2, "0")}</span>
                    <div class="label">
                        <span title={row[0] || "Direct"}>{row[0] || "Direct"}</span>
                        <div class="plot" aria-hidden="true">
                            <i style={`--position:${(row[1] / max) * 100}%`}></i>
                        </div>
                    </div>
                    <strong>{row[1].toLocaleString()}</strong>
                </li>
            {/each}
        </ol>
    {/if}
</section>

<style>
    .ranking { min-width: 0; padding: 16px 16px 8px; }
    header { display: flex; align-items: end; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid var(--line); }
    h2 { margin: 6px 0 0; font-size: var(--text-lg); font-weight: 500; letter-spacing: -0.02em; }
    ol { margin: 0; padding: 0; list-style: none; }
    li {
        display: grid;
        grid-template-columns: 28px minmax(0, 1fr) auto;
        align-items: center;
        min-height: 50px;
        gap: 9px;
        border-bottom: 1px solid var(--line);
    }
    .rank, strong { color: var(--muted); font-size: 12px; font-weight: 500; font-variant-numeric: tabular-nums; }
    .label { min-width: 0; }
    .label > span { display: block; overflow: hidden; color: var(--ink); font-size: 13px; font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
    .plot { position: relative; height: 2px; margin-top: 8px; background: var(--line); border-radius: 99px; }
    .plot i { position: absolute; top: -3px; left: var(--position); width: 8px; height: 8px; border-radius: 50%; background: var(--accent); transform: translateX(-50%); }
    strong { color: var(--ink); }
</style>

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

<section class="ranking" data-reveal>
    <header>
        <div>
            <span>{eyebrow}</span>
            <h2>{title}</h2>
        </div>
        <span>Visitors</span>
    </header>

    {#if rows.length === 0}
        <p class="empty">No traffic recorded for this period.</p>
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
    .ranking {
        min-width: 0;
        padding-top: 15px;
        border-top: 1px solid var(--theme-ink);
    }

    header {
        display: flex;
        align-items: end;
        justify-content: space-between;
        padding-bottom: 13px;
        border-bottom: 1px solid var(--theme-line);
    }

    header span {
        color: var(--theme-muted);
        font-family: "IBM Plex Mono", monospace;
        font-size: 8px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    h2 {
        margin: 5px 0 0;
        color: var(--theme-ink);
        font-family: var(--theme-display);
        font-size: 24px;
        font-weight: 400;
        letter-spacing: -0.04em;
    }

    ol {
        margin: 0;
        padding: 0;
        list-style: none;
    }

    li {
        display: grid;
        grid-template-columns: 27px minmax(0, 1fr) auto;
        align-items: center;
        min-height: 50px;
        gap: 9px;
        border-bottom: 1px solid var(--theme-line);
    }

    .rank,
    strong {
        color: var(--theme-muted);
        font-family: "IBM Plex Mono", monospace;
        font-size: 9px;
        font-weight: 500;
    }

    .label {
        min-width: 0;
    }

    .label > span {
        display: block;
        overflow: hidden;
        color: var(--theme-ink);
        font-size: 11px;
        font-weight: 550;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .plot {
        position: relative;
        height: 1px;
        margin-top: 7px;
        background: var(--theme-line);
    }

    .plot i {
        position: absolute;
        top: -2.5px;
        left: var(--position);
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--theme-accent);
        transform: translateX(-50%);
    }

    strong {
        color: var(--theme-ink);
    }

    .empty {
        margin: 0;
        padding: 30px 0;
        color: var(--theme-muted);
        font-size: 11px;
    }
</style>

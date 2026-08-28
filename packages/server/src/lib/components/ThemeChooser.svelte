<script lang="ts">
    import { themes, type ThemeId } from "$lib/theme";

    let {
        selected,
        onselect,
        compact = false,
    }: {
        selected: ThemeId;
        onselect: (theme: ThemeId) => void;
        compact?: boolean;
    } = $props();
</script>

<section class:compact aria-labelledby={compact ? "appearance-title" : "welcome-title"}>
    {#if !compact}
        <header class="chooser-head">
            <div>
                <span class="kicker">Pulse</span>
                <h1 id="welcome-title" class="serif">Choose how you want to read traffic.</h1>
            </div>
            <p>Two views of the same data. You can change this any time from the sidebar.</p>
        </header>
    {:else}
        <header class="compact-head">
            <span class="kicker">Interface</span>
            <h2 id="appearance-title">Choose a theme</h2>
            <p>Your selection is saved on this device and applied immediately.</p>
        </header>
    {/if}

    <div class="theme-grid">
        {#each themes as theme (theme.id)}
            <button
                type="button"
                class:chosen={selected === theme.id}
                aria-pressed={selected === theme.id}
                aria-label={`Use ${theme.name} theme${theme.recommended ? ", recommended" : ""}`}
                onclick={() => onselect(theme.id)}
            >
                <div class="preview" data-preview={theme.id} aria-hidden="true">
                    <div class="preview-nav"><i></i><span></span><span></span><span></span></div>
                    <div class="preview-copy"><span></span><strong></strong><strong></strong></div>
                    <div class="preview-metrics"><i></i><i></i><i></i><i></i></div>
                    <svg viewBox="0 0 320 82">
                        <path class="grid-line" d="M0 21H320M0 41H320M0 61H320" />
                        <path class="chart-one" d="M0 63C23 64 34 43 55 47S82 59 103 49S132 18 151 28S178 58 198 48S228 20 247 25S274 56 320 31" />
                        <path class="chart-two" d="M0 72C29 69 39 60 63 62S96 70 120 58S157 48 179 57S211 65 235 53S273 43 320 48" />
                    </svg>
                </div>
                <div class="theme-meta">
                    <span>{theme.number}</span>
                    <div>
                        <h3>{theme.name}</h3>
                        <p>{theme.description}</p>
                    </div>
                    <strong>{selected === theme.id ? "Selected" : "Choose"}</strong>
                </div>
                <div class="swatches" aria-hidden="true">
                    {#each theme.palette as color}<i style={`--swatch:${color}`}></i>{/each}
                </div>
                {#if theme.recommended}<span class="recommended">Recommended</span>{/if}
            </button>
        {/each}
    </div>
</section>

<style>
    section {
        width: min(1180px, calc(100% - 40px));
        margin: 0 auto;
        padding: clamp(38px, 7vw, 82px) 0 56px;
        color: var(--ink, #1c1b18);
    }

    .chooser-head {
        display: grid;
        grid-template-columns: 1.25fr 0.75fr;
        align-items: end;
        gap: 48px;
        padding-bottom: 32px;
    }

    h1, h2 {
        margin: 0;
        font-weight: 400;
        letter-spacing: -0.045em;
    }

    h1 {
        font-size: clamp(40px, 5.4vw, 64px);
        line-height: 0.98;
    }

    .chooser-head > p,
    .compact-head p {
        margin: 0;
        color: var(--muted, #6f6c64);
        font-size: 15px;
        line-height: 1.6;
    }

    .theme-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
        margin-top: 24px;
    }

    button {
        position: relative;
        overflow: hidden;
        padding: 0;
        border: 1px solid var(--line, #ddd6c8);
        border-radius: 18px;
        color: inherit;
        background: var(--panel, #fbf8f2);
        font: inherit;
        text-align: left;
        cursor: pointer;
    }

    button:hover { transform: translateY(-2px); }
    button.chosen { border-color: var(--accent, #d24a3e); box-shadow: inset 0 0 0 1px var(--accent, #d24a3e); }

    .preview { height: 210px; padding: 18px; color: #1c1b18; background: #f3efe6; }
    .preview-nav { display: flex; align-items: center; gap: 12px; padding-bottom: 12px; border-bottom: 1px solid currentColor; opacity: 0.32; }
    .preview-nav i { width: 36px; height: 7px; margin-right: auto; border-radius: 99px; background: currentColor; }
    .preview-nav span { width: 27px; height: 3px; border-radius: 99px; background: currentColor; }
    .preview-copy { display: grid; gap: 5px; width: 63%; margin-top: 17px; }
    .preview-copy span, .preview-copy strong { height: 4px; border-radius: 99px; background: currentColor; }
    .preview-copy span { width: 28%; opacity: 0.35; }
    .preview-copy strong { height: 10px; }
    .preview-copy strong:last-child { width: 74%; }
    .preview-metrics { display: grid; grid-template-columns: repeat(4, 1fr); margin-top: 16px; border: 1px solid color-mix(in srgb, currentColor 18%, transparent); border-radius: 12px; overflow: hidden; }
    .preview-metrics i { height: 27px; border-right: 1px solid color-mix(in srgb, currentColor 18%, transparent); }
    .preview-metrics i:last-child { border: 0; }
    svg { width: 100%; margin-top: 9px; overflow: visible; fill: none; }
    .grid-line { stroke: currentColor; stroke-width: 0.6; opacity: 0.12; }
    .chart-one { stroke: #d24a3e; stroke-width: 2; }
    .chart-two { stroke: #7f9ea3; stroke-width: 1.2; stroke-dasharray: 3 4; }
    [data-preview="signal"] {
        color: #f4f0e8;
        background: #121116;
    }
    [data-preview="signal"] .chart-one { stroke: #ff6d5c; }
    [data-preview="signal"] .chart-two { stroke: #7ec4cc; }

    .theme-meta { display: grid; grid-template-columns: 34px minmax(0, 1fr) auto; gap: 12px; padding: 17px 18px 10px; }
    .theme-meta > span { font-family: "IBM Plex Mono", monospace; font-size: 12px; }
    h3 { margin: -2px 0 4px; font-size: 22px; font-weight: 650; letter-spacing: -0.03em; }
    .theme-meta p { margin: 0; color: var(--muted, #6f6c64); font-size: 13px; line-height: 1.45; }
    .theme-meta strong { color: var(--accent, #d24a3e); font-size: 12px; text-transform: uppercase; }
    .swatches { display: flex; padding: 0 18px 16px 64px; }
    .swatches i { width: 18px; height: 6px; border-radius: 99px; background: var(--swatch); }
    .recommended { position: absolute; top: 12px; right: 12px; padding: 5px 8px; border-radius: 999px; color: #fbf8f2; background: #d24a3e; font-size: 11px; text-transform: uppercase; }

    section.compact { width: 100%; padding: 0; }
    .compact-head { margin-bottom: 20px; }
    .compact-head h2 { margin-bottom: 7px; font-size: 28px; font-weight: 650; }
    .compact .theme-grid { margin-top: 0; }
    .compact .preview { height: 158px; }

    @media (max-width: 760px) {
        .chooser-head, .theme-grid { grid-template-columns: 1fr; }
        .theme-meta { grid-template-columns: 28px minmax(0, 1fr); }
        .theme-meta strong { grid-column: 2; }
    }
</style>

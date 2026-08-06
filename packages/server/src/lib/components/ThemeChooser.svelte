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
                <span class="kicker">Counterscale / First edition</span>
                <h1 id="welcome-title">Choose how you want<br />to read your traffic.</h1>
            </div>
            <p>
                Two considered views of the same data. Choose one now;<br />
                you can change it any time from the analytics rail.
            </p>
        </header>
    {:else}
        <header class="compact-head">
            <span class="kicker">Interface</span>
            <h2 id="appearance-title">Choose your analytics edition</h2>
            <p>Your selection is saved on this device and applied immediately.</p>
        </header>
    {/if}

    <div class="theme-grid">
        {#each themes as theme}
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
        color: #201e1a;
        font-family: "Plus Jakarta Sans Variable", "Manrope Variable", sans-serif;
    }

    .chooser-head {
        display: grid;
        grid-template-columns: 1.25fr 0.75fr;
        align-items: end;
        gap: 48px;
        padding-bottom: 38px;
        border-bottom: 1px solid #b8b2a7;
    }

    .kicker {
        display: block;
        margin-bottom: 14px;
        font-family: "IBM Plex Mono", monospace;
        font-size: 10px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    h1,
    h2 {
        margin: 0;
        font-family: "Instrument Serif", "Iowan Old Style", Georgia, serif;
        font-weight: 400;
        letter-spacing: -0.055em;
    }

    h1 {
        font-size: clamp(43px, 6.2vw, 78px);
        line-height: 0.96;
    }

    .chooser-head > p,
    .compact-head p {
        margin: 0;
        color: #6f6a61;
        font-size: 13px;
        line-height: 1.65;
    }

    .theme-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
        margin-top: 28px;
    }

    button {
        position: relative;
        overflow: hidden;
        padding: 0;
        border: 1px solid #c9c3b8;
        border-radius: 0;
        color: inherit;
        background: #f5f1e9;
        font: inherit;
        text-align: left;
        cursor: pointer;
        transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
    }

    button:hover {
        transform: translateY(-2px);
        border-color: #6d675e;
        box-shadow: 0 12px 30px rgba(30, 26, 20, 0.08);
    }

    button:focus-visible {
        outline: 2px solid #7c2f35;
        outline-offset: 3px;
    }

    button.chosen {
        border-color: #7c2f35;
        box-shadow: inset 0 0 0 1px #7c2f35;
    }

    .preview {
        height: 210px;
        padding: 18px;
        color: #171715;
        background: #eae6dc;
    }

    .preview-nav {
        display: flex;
        align-items: center;
        gap: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid currentColor;
        opacity: 0.32;
    }

    .preview-nav i {
        width: 36px;
        height: 7px;
        margin-right: auto;
        background: currentColor;
    }

    .preview-nav span {
        width: 27px;
        height: 3px;
        background: currentColor;
    }

    .preview-copy {
        display: grid;
        gap: 5px;
        width: 63%;
        margin-top: 17px;
    }

    .preview-copy span,
    .preview-copy strong {
        height: 4px;
        background: currentColor;
    }

    .preview-copy span { width: 28%; opacity: 0.35; }
    .preview-copy strong { height: 10px; }
    .preview-copy strong:last-child { width: 74%; }

    .preview-metrics {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        margin-top: 16px;
        border-block: 1px solid color-mix(in srgb, currentColor 24%, transparent);
    }

    .preview-metrics i {
        height: 27px;
        border-right: 1px solid color-mix(in srgb, currentColor 24%, transparent);
    }

    .preview-metrics i:last-child { border: 0; }

    svg {
        width: 100%;
        margin-top: 9px;
        overflow: visible;
        fill: none;
    }

    .grid-line { stroke: currentColor; stroke-width: 0.6; opacity: 0.12; }
    .chart-one { stroke: #7c2f35; stroke-width: 2; }
    .chart-two { stroke: #74745a; stroke-width: 1.2; stroke-dasharray: 3 4; }

    [data-preview="signal"] {
        color: #f0ece4;
        background:
            linear-gradient(rgba(120, 184, 196, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(120, 184, 196, 0.07) 1px, transparent 1px),
            #171216;
        background-size: 18px 18px;
    }
    [data-preview="signal"] .chart-one { stroke: #ff5b4d; }
    [data-preview="signal"] .chart-two { stroke: #78b8c4; }

    .theme-meta {
        display: grid;
        grid-template-columns: 34px minmax(0, 1fr) auto;
        gap: 12px;
        padding: 17px 18px 10px;
    }

    .theme-meta > span {
        font-family: "IBM Plex Mono", monospace;
        font-size: 10px;
    }

    h3 {
        margin: -2px 0 4px;
        font-family: "Instrument Serif", "Iowan Old Style", Georgia, serif;
        font-size: 23px;
        font-weight: 400;
        letter-spacing: -0.035em;
    }

    .theme-meta p {
        margin: 0;
        color: #736e65;
        font-size: 10px;
        line-height: 1.45;
    }

    .theme-meta strong {
        color: #7c2f35;
        font-size: 9px;
        letter-spacing: 0.07em;
        text-transform: uppercase;
    }

    .swatches {
        display: flex;
        padding: 0 18px 16px 64px;
    }

    .swatches i {
        width: 18px;
        height: 4px;
        background: var(--swatch);
    }

    .recommended {
        position: absolute;
        top: 12px;
        right: 12px;
        padding: 5px 7px;
        color: #f5f1e9;
        background: #7c2f35;
        font-family: "IBM Plex Mono", monospace;
        font-size: 8px;
        letter-spacing: 0.07em;
        text-transform: uppercase;
    }

    section.compact {
        width: 100%;
        padding: 0;
        color: var(--theme-ink, #201e1a);
    }

    .compact-head {
        margin-bottom: 20px;
    }

    .compact-head h2 {
        margin-bottom: 7px;
        font-size: 34px;
    }

    .compact .theme-grid {
        margin-top: 0;
    }

    .compact button {
        background: var(--theme-panel, #f5f1e9);
    }

    .compact .preview {
        height: 158px;
    }

    .compact .preview-copy { margin-top: 12px; }
    .compact .preview-metrics { margin-top: 11px; }
    .compact svg { height: 52px; }

    @media (max-width: 760px) {
        .chooser-head {
            grid-template-columns: 1fr;
            gap: 20px;
        }

        .theme-grid {
            grid-template-columns: 1fr;
        }

        .preview {
            height: 185px;
        }

        .theme-meta {
            grid-template-columns: 28px minmax(0, 1fr);
        }

        .theme-meta strong {
            grid-column: 2;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        button { transition: none; }
        button:hover { transform: none; }
    }
</style>

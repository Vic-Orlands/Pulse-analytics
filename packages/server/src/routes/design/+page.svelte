<script lang="ts">
    const filters = [
        { label: "Read", color: "#8b5cf6" },
        { label: "Watch", color: "#dd65ad" },
        { label: "Listen", color: "#5ac9e7" },
        { label: "Browse", color: "#eb5757" },
        { label: "Use", color: "#6377f6" },
        { label: "Build", color: "#f17836" },
        { label: "Learn", color: "#62d2c4" },
        { label: "Join", color: "#63d58e" },
        { label: "Follow", color: "#a4dc4c" },
        { label: "Apply", color: "#f3c94f" },
    ];

    let query = $state("");
    let selected = $state<string[]>([]);

    function toggleFilter(label: string) {
        selected = selected.includes(label)
            ? selected.filter((item) => item !== label)
            : [...selected, label];
    }
</script>

<svelte:head>
    <title>Design Engineers — Resources</title>
    <meta
        name="description"
        content="A curated collection of resources for design engineers."
    />
</svelte:head>

<main class="design-page">
    <svg class="drafting" viewBox="0 0 1100 550" aria-hidden="true">
        <defs>
            <pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
                <line x1="0" y1="0" x2="0" y2="10" />
            </pattern>
            <mask id="ring-mask">
                <rect width="1100" height="550" fill="black" />
                <circle cx="550" cy="0" r="547" fill="white" />
                <circle cx="550" cy="0" r="478" fill="black" />
            </mask>
        </defs>
        <rect class="hatch-ring" width="1100" height="550" mask="url(#ring-mask)" />
        <circle cx="550" cy="0" r="477" />
        <circle cx="550" cy="0" r="308" />
        <circle cx="315" cy="0" r="270" />
        <circle cx="785" cy="0" r="270" />
        <circle class="dashed" cx="550" cy="0" r="307" />
        <circle class="dashed" cx="550" cy="0" r="169" />
        <circle cx="550" cy="240" r="238" />
        <path d="M315 0L550 240L785 0" />
        <path d="M0 0H1100M550 0L534 240M550 0L548 239" />
    </svg>

    <div class="content">
        <div class="spinner" aria-hidden="true"></div>

        <section class="intro" aria-labelledby="page-title">
            <h1 id="page-title">
                The <em>Ultimate</em> Resource<br />
                for Design <em>Engineers.</em>
            </h1>
            <p>Curated by design engineers;<br />— for design engineers.</p>
            <nav class="intro-links" aria-label="Community links">
                <a href="#talent-network">(Talent Network)</a>
                <a href="#source-code">(Source Code)</a>
            </nav>
        </section>

        <div class="rule" aria-hidden="true"></div>

        <section class="resources" aria-labelledby="resources-title">
            <h2 id="resources-title">Browse <em>Resources:</em></h2>
            <div class="filters">
                <label class="search">
                    <span class="sr-only">Search resources</span>
                    <input bind:value={query} type="search" placeholder="Search here..." />
                </label>

                {#each filters as filter}
                    <button
                        type="button"
                        class:active={selected.includes(filter.label)}
                        aria-pressed={selected.includes(filter.label)}
                        onclick={() => toggleFilter(filter.label)}
                    >
                        <i style={`--dot:${filter.color}`}></i>
                        {filter.label}
                    </button>
                {/each}

                <button
                    type="button"
                    class="clear"
                    disabled={!query && selected.length === 0}
                    onclick={() => {
                        query = "";
                        selected = [];
                    }}>Clear All</button
                >
            </div>
        </section>
    </div>
</main>

<style>
    :global(html:has(.design-page)),
    :global(body:has(.design-page)) {
        background: #070709;
    }

    :global(body:has(.design-page)) {
        overflow-x: hidden;
    }

    .design-page {
        position: relative;
        min-height: 100vh;
        overflow: hidden;
        color: #f2f1f0;
        background: #070709;
        font-family: "Manrope Variable", "Avenir Next", sans-serif;
    }

    .drafting {
        position: absolute;
        top: 0;
        left: 50%;
        width: 1100px;
        height: 550px;
        transform: translateX(calc(-50% - 39px));
        fill: none;
        stroke: #18191d;
        stroke-width: 2;
        pointer-events: none;
    }

    .drafting .hatch-ring {
        fill: url(#hatch);
        fill-opacity: 0.56;
        stroke-width: 0;
    }

    .drafting line {
        stroke: #1b1c20;
        stroke-width: 2;
    }

    .drafting .dashed {
        stroke-dasharray: 3 4;
    }

    .content {
        position: relative;
        width: min(900px, calc(100% - 48px));
        margin: 0 auto;
        padding-top: 205px;
        padding-bottom: 48px;
    }

    .spinner {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: repeating-conic-gradient(#63656c 0deg 5deg, transparent 5deg 12deg);
        mask: radial-gradient(circle, transparent 0 12px, #000 13px 20px, transparent 21px);
        opacity: 0.95;
        animation: turn 9s linear infinite;
    }

    .intro {
        margin-top: 55px;
    }

    h1,
    h2 {
        margin: 0;
        font-family: "Bodoni 72", Didot, "Times New Roman", serif;
        font-weight: 400;
        letter-spacing: -0.045em;
    }

    h1 {
        font-size: 47px;
        line-height: 1.19;
    }

    h1 em,
    h2 em {
        font-weight: 400;
    }

    .intro p {
        margin: 36px 0 0;
        color: #a4a3aa;
        font-size: 22px;
        font-weight: 560;
        line-height: 1.55;
        letter-spacing: -0.025em;
    }

    .intro-links {
        display: flex;
        gap: 12px;
        margin-top: 34px;
    }

    .intro-links a {
        color: #929198;
        font-size: 17px;
        font-weight: 650;
        text-decoration: none;
        letter-spacing: -0.025em;
        transition: color 140ms ease;
    }

    .intro-links a:hover {
        color: #f2f1f0;
    }

    .rule {
        width: 100%;
        height: 18px;
        margin-top: 65px;
        background: repeating-linear-gradient(135deg, #1b1c20 0 2px, transparent 2px 11px);
        mask-image: linear-gradient(90deg, #000 0%, #000 77%, transparent 96%);
    }

    .resources {
        margin-top: 70px;
    }

    h2 {
        font-size: 31px;
        line-height: 1;
    }

    .filters {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
        max-width: 810px;
        margin-top: 39px;
    }

    .search {
        width: 275px;
        height: 50px;
    }

    .search input,
    .filters button {
        height: 50px;
        border: 1px solid #292a2f;
        border-radius: 0;
        color: #aaa9b0;
        background: rgba(7, 7, 9, 0.7);
        font-size: 17px;
        font-weight: 650;
    }

    .search input {
        width: 100%;
        padding: 0 13px;
        outline: none;
    }

    .search input::placeholder {
        color: #77777d;
        opacity: 1;
    }

    .search input:focus,
    .filters button:focus-visible {
        border-color: #66676f;
        outline: 1px solid #66676f;
        outline-offset: 2px;
    }

    .search input::-webkit-search-cancel-button {
        filter: invert(1);
        opacity: 0.45;
    }

    .filters button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 11px;
        min-width: 108px;
        padding: 0 20px;
        cursor: pointer;
        transition: border-color 140ms ease, color 140ms ease, background 140ms ease;
    }

    .filters button:hover,
    .filters button.active {
        border-color: #55565e;
        color: #eeeeef;
        background: #111116;
    }

    .filters button i {
        width: 8px;
        height: 8px;
        flex: 0 0 auto;
        border-radius: 50%;
        background: var(--dot);
    }

    .filters .clear {
        min-width: 116px;
        color: #77777d;
    }

    .filters .clear:disabled {
        border-color: #18191d;
        color: #3d3d42;
        cursor: default;
        background: transparent;
    }

    @keyframes turn {
        to {
            transform: rotate(1turn);
        }
    }

    @media (max-width: 700px) {
        .drafting {
            left: 30%;
            width: 850px;
            height: auto;
        }

        .content {
            width: min(100% - 36px, 560px);
            padding-top: 138px;
        }

        .spinner {
            width: 42px;
            height: 42px;
        }

        .intro {
            margin-top: 42px;
        }

        h1 {
            font-size: clamp(35px, 10.5vw, 46px);
        }

        .intro p {
            font-size: 18px;
        }

        .rule {
            margin-top: 52px;
        }

        .resources {
            margin-top: 56px;
        }

        .filters {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .search {
            width: 100%;
            grid-column: 1 / -1;
        }

        .filters button {
            min-width: 0;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .spinner {
            animation: none;
        }
    }
</style>

<script lang="ts">
    import { onMount } from "svelte";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import { ArrowLeft01Icon, Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
    import type { PageProps } from "./$types";

    let { data }: PageProps = $props();
    let origin = $state("https://analytics.example.com");
    let copied = $state("");

    onMount(() => {
        origin = window.location.origin;
    });

    const snippet = (site: string) => `<script id="counterscale-script" data-site-id="${site}" src="${origin}/tracker.js" defer><\/script>`;

    async function copy(site: string) {
        await navigator.clipboard.writeText(snippet(site));
        copied = site;
        window.setTimeout(() => (copied = ""), 1600);
    }
</script>

<svelte:head><title>Settings — Pulse</title></svelte:head>

<main>
    <header>
        <a href="/" aria-label="Back to dashboard"><HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.8} /></a>
        <div><p>Pulse / Settings</p><h1>Tracking installations</h1></div>
    </header>

    <section>
        <div class="intro">
            <span>Collector endpoint</span>
            <code>{origin}/collect</code>
            <p>Install the matching snippet once in each app shell. Client-side route changes are recorded automatically.</p>
        </div>

        <div class="sites">
            {#each data.sites as site, index}
                <article>
                    <div class="site-head">
                        <span class="mono">{String(index + 1).padStart(2, "0")}</span>
                        <h2>{site}</h2>
                        <i></i>
                    </div>
                    <pre>{snippet(site)}</pre>
                    <button onclick={() => copy(site)}>
                        <HugeiconsIcon icon={copied === site ? Tick02Icon : Copy01Icon} size={14} strokeWidth={1.8} />
                        {copied === site ? "Copied" : "Copy snippet"}
                    </button>
                </article>
            {/each}
        </div>
    </section>
</main>

<style>
    main { width: min(900px, 100%); margin: 0 auto; padding: 26px 20px 50px; }
    header { display: flex; align-items: center; gap: 13px; padding-bottom: 22px; border-bottom: 1px solid var(--line); }
    header a { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid var(--line); border-radius: 8px; color: var(--ink); background: white; }
    header p, .intro > span { margin: 0 0 3px; color: var(--muted); font-size: 8.5px; font-weight: 750; letter-spacing: .08em; text-transform: uppercase; }
    h1 { margin: 0; font-size: 18px; letter-spacing: -.04em; }
    section { padding-top: 24px; }
    .intro { padding: 17px; border: 1px solid #cfdef8; border-radius: 10px; background: #f5f8ff; }
    .intro code { color: #174eb9; font-family: "IBM Plex Mono", monospace; font-size: 11px; }
    .intro p { margin: 9px 0 0; color: var(--muted); font-size: 10px; }
    .sites { display: grid; gap: 10px; margin-top: 12px; }
    article { padding: 15px; border: 1px solid var(--line); border-radius: 10px; background: white; }
    .site-head { display: flex; align-items: center; gap: 10px; }
    .site-head span { color: #9aa6b8; font-size: 9px; }
    h2 { margin: 0; font-size: 12px; text-transform: capitalize; }
    .site-head i { width: 6px; height: 6px; margin-left: auto; border-radius: 50%; background: var(--mint); box-shadow: 0 0 0 3px rgba(25,169,116,.12); }
    pre { overflow-x: auto; margin: 13px 0 10px; padding: 12px; border-radius: 7px; color: #33425a; background: #f4f6f9; font-family: "IBM Plex Mono", monospace; font-size: 9px; white-space: pre-wrap; word-break: break-all; }
    button { display: flex; align-items: center; gap: 6px; min-height: 31px; border: 1px solid #d5deea; border-radius: 7px; padding: 0 10px; color: #344158; background: white; font-size: 9px; font-weight: 700; cursor: pointer; }
</style>

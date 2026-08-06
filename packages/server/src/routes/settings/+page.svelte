<script lang="ts">
    import { onMount } from "svelte";
    import { applyTheme, defaultTheme, readTheme, type ThemeId } from "$lib/theme";

    let theme = $state<ThemeId>(defaultTheme);
    onMount(() => { theme = readTheme() ?? defaultTheme; applyTheme(theme); });
</script>

<svelte:head><title>Preferences — Pulse</title></svelte:head>

<main data-theme={theme}>
    <section>
        <span>Pulse / Preferences</span>
        <h1>Settings now live<br /><em>where they act.</em></h1>
        <p>Appearance is available from the theme icon in the analytics rail. Tracking installations open as a sheet from the code icon.</p>
        <a href="/">Return to analytics <span aria-hidden="true">→</span></a>
    </section>
</main>

<style>
    main{--paper:#eae6dc;--panel:#f2eee4;--ink:#171715;--muted:#74745a;--line:#c8c1b5;--accent:#7c2f35;display:grid;min-height:100vh;place-items:center;padding:24px;color:var(--ink);background:var(--paper);font-family:"Plus Jakarta Sans Variable",system-ui,sans-serif}main[data-theme="signal"]{--paper:#111014;--panel:#19171d;--ink:#f0ece4;--muted:#9e969d;--line:#373139;--accent:#ff6759}section{width:min(520px,100%);padding:34px;border:1px solid var(--line);background:var(--panel)}section>span{color:var(--muted);font-family:"IBM Plex Mono",monospace;font-size:8px;text-transform:uppercase}h1{margin:18px 0 24px;font-family:"Instrument Serif",Georgia,serif;font-size:clamp(44px,8vw,68px);font-weight:400;line-height:.88;letter-spacing:-.045em}h1 em{color:var(--accent);font-weight:400}p{max-width:410px;margin:0 0 30px;color:var(--muted);font-size:10px;line-height:1.75}a{display:flex;justify-content:space-between;padding:12px 14px;border:1px solid var(--ink);color:var(--paper);background:var(--ink);font-family:"IBM Plex Mono",monospace;font-size:8px;text-decoration:none;text-transform:uppercase}a:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
</style>

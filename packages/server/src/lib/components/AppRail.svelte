<script lang="ts">
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import { Activity03Icon, CodeIcon, Home04Icon, Moon01Icon, Sun01Icon } from "@hugeicons/core-free-icons";
    import type { ThemeId } from "$lib/theme";

    let { theme, current, ontheme, oninstall }: { theme: ThemeId; current: "dashboard" | "signals"; ontheme: () => void; oninstall: () => void } = $props();
</script>

<aside class="rail" aria-label="Analytics navigation">
    <a class:active={current === "dashboard"} href="/" aria-label="Dashboard" data-label="Dashboard"><HugeiconsIcon icon={Home04Icon} size={16} strokeWidth={1.6} /></a>
    <a class:active={current === "signals"} href="/signals" aria-label="Signal Ledger" data-label="Signal Ledger"><HugeiconsIcon icon={Activity03Icon} size={16} strokeWidth={1.6} /></a>
    <span></span>
    <button id="installation-trigger" onclick={oninstall} aria-label="Open tracking installations" data-label="Install tracking"><HugeiconsIcon icon={CodeIcon} size={16} strokeWidth={1.6} /></button>
    <button onclick={ontheme} aria-label={`Switch to ${theme === "signal" ? "Observatory" : "Signal Room"} theme`} data-label={theme === "signal" ? "Light edition" : "Dark edition"}><HugeiconsIcon icon={theme === "signal" ? Sun01Icon : Moon01Icon} size={16} strokeWidth={1.6} /></button>
</aside>

<style>
    .rail { position: fixed; z-index: 40; top: 50%; left: 18px; display: grid; width: 42px; padding: 5px; background: color-mix(in srgb, var(--panel) 92%, transparent); box-shadow: 0 0 0 1px var(--line), 0 18px 50px color-mix(in srgb, var(--ink) 8%, transparent); transform: translateY(-50%); backdrop-filter: blur(14px); }
    a, button { position: relative; display: grid; width: 30px; height: 34px; place-items: center; border: 0; color: var(--muted); background: transparent; cursor: pointer; transition: color 140ms ease, background 140ms ease; }
    a { text-decoration: none; }
    a:hover, button:hover, a.active { color: var(--ink); background: color-mix(in srgb, var(--ink) 7%, transparent); }
    a.active::after { position: absolute; right: -6px; width: 1px; height: 14px; background: var(--accent); content: ""; }
    aside > span { height: 1px; margin: 5px 3px; background: var(--line); }
    a::before, button::before { position: absolute; top: 50%; left: 42px; padding: 6px 8px; border: 1px solid var(--line); color: var(--paper); background: var(--ink); font-family: "IBM Plex Mono", monospace; font-size: 7px; text-transform: uppercase; white-space: nowrap; opacity: 0; content: attr(data-label); transform: translate(-4px, -50%); transition: opacity 120ms ease, transform 120ms ease; pointer-events: none; }
    @media (hover: hover) and (pointer: fine) { a:hover::before, button:hover::before, a:focus-visible::before, button:focus-visible::before { opacity: 1; transform: translate(0, -50%); } }
    a:focus-visible, button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    @media (max-width: 720px) { .rail { top: auto; bottom: 12px; left: 50%; grid-auto-flow: column; width: auto; transform: translateX(-50%); }.rail > span { width: 1px; height: auto; margin: 4px 5px; } a.active::after { right: auto; bottom: -6px; width: 14px; height: 1px; } a::before, button::before { display: none; } }
    @media (prefers-reduced-motion: reduce) { a, button, a::before, button::before { transition: none; } }
</style>

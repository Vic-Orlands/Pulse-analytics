<script lang="ts">
    import Code from "phosphor-svelte/lib/Code";
    import House from "phosphor-svelte/lib/House";
    import Moon from "phosphor-svelte/lib/Moon";
    import Pulse from "phosphor-svelte/lib/Pulse";
    import Sun from "phosphor-svelte/lib/Sun";
    import type { Snippet } from "svelte";
    import PulseMark from "$lib/components/PulseMark.svelte";
    import { appearance } from "$lib/appearance.svelte";
    import { resolve } from "$app/paths";
    import { goto } from "$app/navigation";

    let {
        current,
        siteId,
        sites,
        interval,
        title,
        oninstall,
        children,
    }: {
        current: "dashboard" | "signals";
        siteId: string;
        sites: string[];
        interval: string;
        title: string;
        oninstall: () => void;
        children: Snippet;
    } = $props();

    const periods = [
        { id: "today", label: "Today" },
        { id: "7d", label: "7d" },
        { id: "14d", label: "14d" },
        { id: "30d", label: "30d" },
        { id: "90d", label: "90d" },
    ];

    const query = $derived(`site=${encodeURIComponent(siteId)}&interval=${encodeURIComponent(interval)}`);

    function changeSite(event: Event) {
        const select = event.currentTarget as HTMLSelectElement;
        const path = current === "signals" ? "/signals" : "/dashboard";
        void goto(
            resolve(`${path}?site=${encodeURIComponent(select.value)}&interval=${encodeURIComponent(interval)}`),
            { keepFocus: true, noScroll: true },
        );
    }
</script>

<div class="shell" data-theme={appearance.id}>
    <aside class="sidebar" aria-label="Pulse navigation">
        <a class="brand" href={resolve(`/dashboard?${query}`)} aria-label="Pulse Analytics home">
            <PulseMark size={18} />
            Pulse Analytics
        </a>

        <div class="site-form">
            <label>
                <span class="kicker">App</span>
                <select name="site" value={siteId} onchange={changeSite}>
                    {#if sites.length}
                        {#each sites as site (site)}
                            <option value={site}>{site}</option>
                        {/each}
                    {:else}
                        <option value="">Install tracking</option>
                    {/if}
                </select>
            </label>
        </div>

        <nav class="nav">
            <a class:active={current === "dashboard"} href={resolve(`/dashboard?${query}`)}>
                <House size={16} weight="fill" />
                Dashboard
            </a>
            <a class:active={current === "signals"} href={resolve(`/signals?${query}`)}>
                <Pulse size={16} weight="fill" />
                Signals
            </a>
        </nav>

        <div class="sidebar-foot">
            <button id="installation-trigger" type="button" onclick={oninstall}>
                <Code size={16} weight="fill" />
                Install tracking
            </button>
            <button type="button" onclick={() => appearance.toggle()}>
                {#if appearance.id === "signal"}
                    <Sun size={16} weight="fill" />
                {:else}
                    <Moon size={16} weight="fill" />
                {/if}
                {appearance.id === "signal" ? "Light" : "Dark"}
            </button>
        </div>
    </aside>

    <div class="workspace">
        <header class="topbar">
            <div class="topbar-inner">
                <h1>{title}</h1>
                <div class="segmented" aria-label="Time period">
                    {#each periods as period (period.id)}
                        <a
                            class:active={interval === period.id}
                            href={resolve(`${current === "signals" ? "/signals" : "/dashboard"}?site=${encodeURIComponent(siteId)}&interval=${period.id}`)}
                        >
                            {period.label}
                        </a>
                    {/each}
                </div>
            </div>
        </header>
        <div class="canvas">
            {@render children()}
        </div>
    </div>
</div>

<style>
    .shell {
        display: grid;
        min-height: 100vh;
        grid-template-columns: var(--sidebar) minmax(0, 1fr);
        color: var(--ink);
        background: var(--paper);
    }

    .sidebar {
        position: sticky;
        top: 0;
        display: flex;
        height: 100vh;
        flex-direction: column;
        gap: 20px;
        padding: 20px 16px;
        border-right: 1px solid var(--line);
        background: var(--paper);
    }

    .brand {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 4px 4px;
        color: inherit;
        font-size: 13px;
        font-weight: 500;
        letter-spacing: -0.02em;
        text-decoration: none;
        white-space: nowrap;
    }

    .site-form label {
        display: grid;
        gap: 6px;
    }

    .site-form select {
        width: 100%;
        height: 36px;
        padding: 0 10px;
        border: 1px solid var(--line);
        border-radius: 8px;
        color: var(--ink);
        background: var(--panel);
        cursor: pointer;
    }

    .nav,
    .sidebar-foot {
        display: grid;
        gap: 4px;
    }

    .nav {
        padding-top: 4px;
    }

    .sidebar-foot {
        margin-top: auto;
        padding-top: 12px;
        border-top: 1px solid var(--line);
    }

    .nav a,
    .sidebar-foot button {
        display: flex;
        min-height: 36px;
        align-items: center;
        gap: 10px;
        padding: 0 10px;
        border: 0;
        border-radius: 8px;
        color: var(--muted);
        background: transparent;
        font-size: 13px;
        font-weight: 500;
        text-align: left;
        text-decoration: none;
        cursor: pointer;
    }

    .nav a:hover,
    .sidebar-foot button:hover {
        color: var(--ink);
        background: color-mix(in srgb, var(--ink) 6%, transparent);
    }

    .nav a.active {
        color: var(--ink);
        background: color-mix(in srgb, var(--ink) 8%, transparent);
        font-weight: 500;
    }

    .workspace {
        min-width: 0;
    }

    .topbar {
        position: sticky;
        z-index: 20;
        top: 0;
        padding: 12px 0;
        background: var(--paper);
    }

    .topbar-inner {
        display: flex;
        width: min(1180px, calc(100% - 48px));
        min-height: 40px;
        margin: 0 auto;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
    }

    .topbar h1 {
        margin: 2px 0 0;
        font-size: var(--text-lg);
        font-weight: 500;
        letter-spacing: -0.02em;
        line-height: 1.3;
    }

    .canvas {
        width: min(1180px, calc(100% - 48px));
        margin: 0 auto;
        padding: 28px 0 72px;
    }

    @media (max-width: 900px) {
        .shell {
            grid-template-columns: 1fr;
        }

        .sidebar {
            position: fixed;
            z-index: 40;
            top: auto;
            right: 12px;
            bottom: 12px;
            left: 12px;
            height: auto;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 8px;
            padding: 10px;
            border: 1px solid var(--line);
            border-radius: 8px;
            background: var(--panel);
        }

        .brand,
        .site-form {
            display: none;
        }

        .nav,
        .sidebar-foot {
            display: contents;
        }

        .nav a,
        .sidebar-foot button {
            flex: 1 1 auto;
            justify-content: center;
            min-height: 44px;
            font-size: 12px;
        }

        .nav a.active {
            box-shadow: none;
            background: color-mix(in srgb, var(--ink) 10%, transparent);
            color: var(--ink);
        }

        .topbar-inner {
            width: min(100% - 32px, 1180px);
            align-items: flex-start;
            flex-direction: column;
            padding: 6px 0 4px;
        }

        .canvas {
            width: min(100% - 32px, 1180px);
            padding-bottom: 112px;
        }
    }
</style>

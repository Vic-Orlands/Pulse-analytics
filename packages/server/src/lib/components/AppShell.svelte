<script lang="ts">
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        Activity03Icon,
        CodeIcon,
        Home04Icon,
        Moon01Icon,
        Sun01Icon,
    } from "@hugeicons/core-free-icons";
    import type { Snippet } from "svelte";
    import { appearance } from "$lib/appearance.svelte";

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
</script>

<div class="shell" data-theme={appearance.id}>
    <aside class="sidebar" aria-label="Pulse navigation">
        <a class="brand" href={`/?${query}`} aria-label="Pulse analytics home">
            <span class="pulse-mark" aria-hidden="true"><i></i><i></i><i></i></span>
            <span class="serif">Pulse</span>
        </a>

        <form class="site-form" method="GET" action={current === "signals" ? "/signals" : "/"}>
            <input type="hidden" name="interval" value={interval} />
            <label>
                <span class="kicker">Application</span>
                <select name="site" value={siteId} onchange={(event) => event.currentTarget.form?.requestSubmit()}>
                    {#if sites.length}
                        {#each sites as site (site)}
                            <option value={site}>{site}</option>
                        {/each}
                    {:else}
                        <option value="">Install tracking to create an app</option>
                    {/if}
                </select>
            </label>
        </form>

        <nav class="nav">
            <a class:active={current === "dashboard"} href={`/?${query}`}>
                <HugeiconsIcon icon={Home04Icon} size={16} strokeWidth={1.7} />
                Dashboard
            </a>
            <a class:active={current === "signals"} href={`/signals?${query}`}>
                <HugeiconsIcon icon={Activity03Icon} size={16} strokeWidth={1.7} />
                Signals
            </a>
        </nav>

        <div class="sidebar-foot">
            <button id="installation-trigger" type="button" onclick={oninstall}>
                <HugeiconsIcon icon={CodeIcon} size={16} strokeWidth={1.7} />
                Install tracking
            </button>
            <button type="button" onclick={() => appearance.toggle()}>
                <HugeiconsIcon icon={appearance.id === "signal" ? Sun01Icon : Moon01Icon} size={16} strokeWidth={1.7} />
                {appearance.id === "signal" ? "Paper theme" : "Night theme"}
            </button>
        </div>
    </aside>

    <div class="workspace">
        <header class="topbar">
            <div>
                <p class="kicker">{siteId || "Pulse"}</p>
                <h1 class="serif">{title}</h1>
            </div>
            <div class="segmented" aria-label="Time period">
                {#each periods as period (period.id)}
                    <a
                        class:active={interval === period.id}
                        href={`${current === "signals" ? "/signals" : "/"}?site=${encodeURIComponent(siteId)}&interval=${period.id}`}
                    >
                        {period.label}
                    </a>
                {/each}
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
        gap: 28px;
        padding: 28px 22px;
        border-right: 1px solid var(--line);
        background: color-mix(in srgb, var(--panel) 88%, transparent);
    }

    .brand {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        color: inherit;
        font-size: 28px;
        letter-spacing: -0.04em;
        text-decoration: none;
    }

    .site-form label {
        display: grid;
        gap: 8px;
    }

    .site-form select {
        width: 100%;
        height: 42px;
        padding: 0 12px;
        border: 1px solid var(--line);
        border-radius: 12px;
        color: var(--ink);
        background: var(--paper);
        cursor: pointer;
    }

    .nav,
    .sidebar-foot {
        display: grid;
        gap: 6px;
    }

    .nav {
        margin-top: 8px;
    }

    .sidebar-foot {
        margin-top: auto;
    }

    .nav a,
    .sidebar-foot button {
        display: flex;
        min-height: 42px;
        align-items: center;
        gap: 10px;
        padding: 0 12px;
        border: 0;
        border-radius: 12px;
        color: var(--muted);
        background: transparent;
        font-size: 14px;
        font-weight: 600;
        text-align: left;
        text-decoration: none;
        cursor: pointer;
    }

    .nav a:hover,
    .sidebar-foot button:hover,
    .nav a.active {
        color: var(--ink);
        background: color-mix(in srgb, var(--ink) 6%, transparent);
    }

    .nav a.active {
        box-shadow: inset 3px 0 0 var(--accent);
    }

    .workspace {
        min-width: 0;
    }

    .topbar {
        position: sticky;
        z-index: 20;
        top: 0;
        display: flex;
        min-height: 84px;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 18px 28px;
        border-bottom: 1px solid var(--line);
        background: color-mix(in srgb, var(--paper) 88%, transparent);
        backdrop-filter: blur(16px);
    }

    .topbar h1 {
        margin: 4px 0 0;
        font-size: 28px;
        letter-spacing: -0.04em;
        line-height: 1;
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
            border-radius: 18px;
            background: color-mix(in srgb, var(--panel) 94%, transparent);
            box-shadow: var(--shadow);
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
            background: var(--ink);
            color: var(--paper);
        }

        .topbar {
            align-items: flex-start;
            flex-direction: column;
            padding: 18px 20px 16px;
        }

        .canvas {
            width: min(100% - 32px, 1180px);
            padding-bottom: 112px;
        }
    }
</style>

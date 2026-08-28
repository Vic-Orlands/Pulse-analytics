<script lang="ts">
    import GithubLogo from "phosphor-svelte/lib/GithubLogo";
    import Moon from "phosphor-svelte/lib/Moon";
    import Sun from "phosphor-svelte/lib/Sun";
    import type { PageProps } from "./$types";
    import PulseMark from "$lib/components/PulseMark.svelte";
    import { appearance } from "$lib/appearance.svelte";
    import { resolve } from "$app/paths";

    let { data }: PageProps = $props();

    const githubUrl = "https://github.com/Vic-Orlands/pulse-analytics";
    const portfolioUrl = "https://mezie.dev";
    const email = "chimezieinnocent39@gmail.com";
    const ownerLabel = $derived(data.signedIn ? "Dashboard" : "Log in");
</script>

<svelte:head>
    <title>Pulse — Private web analytics</title>
    <meta
        name="description"
        content="Pulse is a personal, cookieless analytics dashboard for the sites you run on Cloudflare. No public signup."
    />
</svelte:head>

<div class="home">
    <header class="top">
        <a class="brand" href={resolve("/")} aria-label="Pulse home">
            <PulseMark size={18} />
            Pulse
        </a>
        <nav aria-label="Site">
            <a class="icon-btn" href={githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub">
                <GithubLogo size={18} weight="fill" />
            </a>
            <button type="button" class="icon-btn" onclick={() => appearance.toggle()} aria-label="Toggle theme">
                {#if appearance.id === "signal"}
                    <Sun size={18} weight="fill" />
                {:else}
                    <Moon size={18} weight="fill" />
                {/if}
            </button>
        </nav>
    </header>

    <section class="intro">
        <h1>Privacy-first analytics for the sites you run</h1>
        <p class="lede">
            Pulse is a private, multi-site dashboard on Cloudflare Workers and Analytics Engine.
            It measures visitors, views, sessions, and traffic sources without cookies or personal data.
            This is a personal app: there is no public signup.
        </p>
        <p class="note">Cookieless traffic on Cloudflare. No signup.</p>
        <div class="actions">
            <a class="login" href={resolve(data.signedIn ? "/dashboard" : "/login")}>{ownerLabel}</a>
            <a class="ghost" href={githubUrl} target="_blank" rel="noreferrer">View on GitHub</a>
        </div>
    </section>

    <section class="showcase" aria-labelledby="showcase-title">
        <p class="kicker">Product insight</p>
        <h2 id="showcase-title">Inside the Pulse dashboard</h2>
        <p class="lede">
            Compact Inter type, a quiet sidebar, and the analytics grid — the same surface used to
            read live traffic.
        </p>
        <figure class="panel stage">
            <video
                src="/pulse-preview.mp4"
                controls
                autoplay
                muted
                loop
                playsinline
                preload="metadata"
            >
                Video not supported.
            </video>
            <figcaption>Pulse dashboard walkthrough: sidebar, type scale, and analytics views.</figcaption>
        </figure>
    </section>

    <section class="about" aria-labelledby="about-title">
        <p class="kicker">About</p>
        <h2 id="about-title">What Pulse does</h2>
        <p class="lede">
            Pulse is a private analytics dashboard for the sites you run. A Cloudflare Worker serves
            both the tracker and the dashboard, measuring visitors, views, sessions, pages, referrers,
            countries, and devices without cookies or personal data. The first pageview creates an
            app automatically.
        </p>
    </section>

    <footer>
        <span>MIT · Pulse Analytics</span>
        <a class="icon-btn" href={githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub">
            <GithubLogo size={16} weight="fill" />
        </a>
        <a href={`mailto:${email}`}>{email}</a>
        <a href={portfolioUrl} target="_blank" rel="noreferrer">mezie.dev</a>
    </footer>
</div>

<style>
    .home {
        width: min(960px, calc(100% - 40px));
        margin: 0 auto;
        padding: 20px 0 72px;
    }

    .top {
        display: flex;
        min-height: 56px;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
    }

    .brand,
    nav,
    .actions,
    footer {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .brand {
        gap: 8px;
        color: var(--ink);
        font-weight: 500;
        text-decoration: none;
    }

    nav {
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 4px;
    }

    .icon-btn {
        display: inline-flex;
        width: 32px;
        height: 32px;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: 0;
        border-radius: 8px;
        color: var(--ink);
        background: transparent;
        cursor: pointer;
        text-decoration: none;
    }

    .ghost,
    .login,
    footer a:not(.icon-btn) {
        display: inline-flex;
        min-height: 36px;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 0 12px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        text-decoration: none;
    }

    .ghost {
        color: var(--ink);
        background: transparent;
        border: 1px solid var(--line);
        cursor: pointer;
    }

    .login {
        color: var(--paper);
        background: var(--ink);
        border: 1px solid var(--ink);
    }

    .login:hover {
        background: var(--accent);
        border-color: var(--accent);
    }

    .intro,
    .showcase,
    .about {
        margin-top: 48px;
    }

    h1,
    h2 {
        max-width: 34rem;
        margin: 8px 0 12px;
    }

    .lede,
    .note,
    figcaption {
        max-width: 38rem;
        color: var(--muted);
        font-size: 14px;
        line-height: 1.55;
    }

    .lede {
        margin: 0 0 16px;
    }

    .note {
        margin: 0 0 20px;
    }

    .actions {
        flex-wrap: wrap;
    }

    .stage {
        margin: 20px 0 0;
        padding: 10px;
    }

    video {
        display: block;
        width: 100%;
        border-radius: 8px;
        background: #121116;
    }

    figcaption {
        margin: 10px 4px 2px;
        font-size: 12px;
    }

    footer {
        flex-wrap: wrap;
        margin-top: 56px;
        color: var(--muted);
        font-size: 12px;
    }

    footer a:not(.icon-btn) {
        min-height: 28px;
        padding: 0;
        color: var(--ink);
    }

    @media (max-width: 720px) {
        .home {
            width: min(100% - 32px, 960px);
        }

        .intro,
        .showcase,
        .about {
            margin-top: 36px;
        }
    }
</style>

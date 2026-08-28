<script lang="ts">
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import { Moon01Icon, Sun01Icon } from "@hugeicons/core-free-icons";
    import type { PageProps } from "./$types";
    import { appearance } from "$lib/appearance.svelte";
    import { resolve } from "$app/paths";

    let { data }: PageProps = $props();

    const githubUrl = "https://github.com/Vic-Orlands/pulse-analytics";
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
            <span class="pulse-mark" aria-hidden="true"><i></i><i></i><i></i></span>
            Pulse
        </a>
        <nav aria-label="Site">
            <a class="ghost" href={githubUrl} target="_blank" rel="noreferrer">
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                    <path
                        fill="currentColor"
                        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.68 7.68 0 0 1 8 4.77c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
                    />
                </svg>
                GitHub
            </a>
            <a class="login" href={resolve(data.signedIn ? "/dashboard" : "/login")}>{ownerLabel}</a>
            <button type="button" class="ghost icon" onclick={() => appearance.toggle()} aria-label="Toggle theme">
                <HugeiconsIcon icon={appearance.id === "signal" ? Sun01Icon : Moon01Icon} size={16} strokeWidth={1.7} />
            </button>
        </nav>
    </header>

    <section class="intro">
        <p class="kicker">Personal analytics</p>
        <h1>Privacy-friendly analytics for the sites you run</h1>
        <p class="lede">
            Pulse is a private, multi-site dashboard on Cloudflare Workers and Analytics Engine.
            It measures visitors, views, sessions, and traffic sources without cookies or personal data.
            This is a personal app: there is no public signup.
        </p>
        <div class="actions">
            <a class="login" href={resolve(data.signedIn ? "/dashboard" : "/login")}>{ownerLabel}</a>
            <a class="ghost" href={githubUrl} target="_blank" rel="noreferrer">View on GitHub</a>
        </div>
        <p class="note">Owner login only. Visitors can read about Pulse and watch the product walkthrough.</p>
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
                Your browser cannot play this video.
            </video>
            <figcaption>Pulse dashboard walkthrough: sidebar, type scale, and analytics views.</figcaption>
        </figure>
    </section>

    <section class="about" aria-labelledby="about-title">
        <p class="kicker">About</p>
        <h2 id="about-title">What Pulse tracks, and what it does not</h2>
        <ul>
            <li>
                <strong>Cookieless by design.</strong>
                Page views, visitors, sessions, bounce rate, pages, referrers, campaigns, countries,
                and devices — without names, emails, or raw IP addresses.
            </li>
            <li>
                <strong>You run the worker.</strong>
                A Cloudflare Worker serves both the tracker and the dashboard. The first pageview
                creates an app automatically.
            </li>
            <li>
                <strong>Owner access only.</strong>
                GitHub is public. The dashboard is not. There is no account creation flow.
            </li>
        </ul>
    </section>

    <footer>
        <span>MIT · Pulse Analytics</span>
        <a href={githubUrl} target="_blank" rel="noreferrer">GitHub</a>
        <a href={resolve("/login")}>Log in</a>
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
        color: var(--ink);
        font-weight: 650;
        text-decoration: none;
    }

    nav {
        flex-wrap: wrap;
        justify-content: flex-end;
    }

    .ghost,
    .login,
    footer a {
        display: inline-flex;
        min-height: 36px;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 0 12px;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 600;
        text-decoration: none;
    }

    .ghost {
        color: var(--ink);
        background: transparent;
        border: 1px solid var(--line);
        cursor: pointer;
    }

    .ghost.icon {
        width: 36px;
        padding: 0;
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
    .about li,
    figcaption {
        max-width: 38rem;
        color: var(--muted);
        font-size: 14px;
        line-height: 1.55;
    }

    .lede {
        margin: 0 0 20px;
    }

    .note {
        margin: 14px 0 0;
        font-size: 12px;
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
        border-radius: 12px;
        background: #121116;
    }

    figcaption {
        margin: 10px 6px 6px;
        font-size: 12px;
    }

    .about ul {
        display: grid;
        gap: 14px;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .about li {
        padding: 16px 18px;
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: var(--panel);
    }

    .about strong {
        display: block;
        margin-bottom: 4px;
        color: var(--ink);
        font-size: 13px;
        font-weight: 650;
    }

    footer {
        flex-wrap: wrap;
        margin-top: 56px;
        color: var(--muted);
        font-size: 12px;
    }

    footer a {
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

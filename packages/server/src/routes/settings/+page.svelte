<script lang="ts">
    import ThemeChooser from "$lib/components/ThemeChooser.svelte";
    import { appearance } from "$lib/appearance.svelte";
</script>

<svelte:head><title>Preferences — Pulse</title></svelte:head>

<main>
    <section class="panel">
        <p class="kicker">Pulse / Preferences</p>
        <h1 class="serif">Appearance</h1>
        <p>Theme is also available from the sidebar on every analytics page.</p>
        <ThemeChooser selected={appearance.id} onselect={(theme) => appearance.set(theme)} compact />
        <a href="/">Return to analytics <span aria-hidden="true">→</span></a>
    </section>
</main>

<style>
    main {
        display: grid;
        min-height: 100vh;
        place-items: center;
        padding: 24px;
    }

    section {
        width: min(760px, 100%);
        padding: 32px;
    }

    h1 {
        margin: 10px 0 12px;
        font-size: clamp(36px, 6vw, 52px);
        letter-spacing: -0.045em;
    }

    p {
        max-width: 460px;
        margin: 0 0 28px;
        color: var(--muted);
    }

    a {
        display: flex;
        justify-content: space-between;
        margin-top: 24px;
        padding: 12px 14px;
        border-radius: 12px;
        color: var(--paper);
        background: var(--ink);
        font-weight: 650;
        text-decoration: none;
    }
</style>

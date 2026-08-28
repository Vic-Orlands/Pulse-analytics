<script lang="ts">
    import { enhance } from "$app/forms";
    import { onMount } from "svelte";
    import type { PageProps } from "./$types";

    let { form }: PageProps = $props();
    let passwordInput: HTMLInputElement;

    onMount(() => passwordInput.focus());
</script>

<svelte:head>
    <title>Sign in — Pulse</title>
    <meta name="description" content="Enter your Pulse analytics dashboard." />
</svelte:head>

<main>
    <section class="panel">
        <span class="pulse-mark" aria-hidden="true"><i></i><i></i><i></i></span>
        <p class="kicker">Private dashboard</p>
        <h1>Welcome back</h1>
        <p>Enter the shared password to continue to your analytics.</p>
        <form method="POST" use:enhance>
            <input class="username" name="username" value="counterscale" autocomplete="username" tabindex="-1" aria-hidden="true" />
            <label for="password">Password</label>
            <input bind:this={passwordInput} id="password" name="password" type="password" autocomplete="current-password" required aria-invalid={form?.invalid ? "true" : undefined} aria-describedby={form?.invalid ? "password-error" : undefined} />
            {#if form?.invalid}<small id="password-error" role="alert">That password did not match. Please try again.</small>{/if}
            <button>Continue <span aria-hidden="true">→</span></button>
        </form>
        <footer>Encrypted session · No public access</footer>
    </section>
</main>

<style>
    main {
        display: grid;
        min-height: 100vh;
        place-items: center;
        padding: 24px;
        background:
            radial-gradient(circle at top left, color-mix(in srgb, var(--accent) 16%, transparent), transparent 36%),
            var(--paper);
    }

    section {
        width: min(420px, 100%);
        padding: 32px;
    }

    .pulse-mark { margin-bottom: 22px; }

    h1 {
        margin: 10px 0 12px;
        font-size: var(--text-lg);
        font-weight: 600;
        letter-spacing: -0.02em;
        line-height: 1.3;
    }

    section > p {
        max-width: 320px;
        margin: 0 0 28px;
        color: var(--muted);
    }

    label {
        display: block;
        margin-bottom: 8px;
        color: var(--muted);
        font-size: 12px;
        font-weight: 650;
    }

    input {
        width: 100%;
        height: 46px;
        padding: 0 12px;
        border: 1px solid var(--line);
        border-radius: 12px;
        color: var(--ink);
        background: var(--paper);
    }

    input:focus {
        outline: 0;
        border-color: var(--accent);
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 16%, transparent);
    }

    input[aria-invalid="true"] { border-color: var(--accent); }

    .username {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        border: 0;
        clip: rect(0, 0, 0, 0);
        overflow: hidden;
    }

    small {
        display: block;
        margin-top: 8px;
        color: var(--accent);
        font-size: 12px;
    }

    button {
        display: flex;
        width: 100%;
        height: 46px;
        align-items: center;
        justify-content: space-between;
        margin-top: 14px;
        padding: 0 14px;
        border: 0;
        border-radius: 12px;
        color: var(--paper);
        background: var(--ink);
        font-weight: 650;
        cursor: pointer;
    }

    button:hover { background: var(--accent); }

    footer {
        margin-top: 20px;
        color: var(--muted);
        font-size: 12px;
    }
</style>

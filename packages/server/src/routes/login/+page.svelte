<script lang="ts">
    import { enhance } from "$app/forms";
    import { onMount } from "svelte";
    import type { PageProps } from "./$types";
    import { resolve } from "$app/paths";

    let { form }: PageProps = $props();
    let passwordInput: HTMLInputElement;

    onMount(() => passwordInput.focus());
</script>

<svelte:head>
    <title>Sign in — Pulse</title>
    <meta name="description" content="Owner sign in for Pulse." />
</svelte:head>

<main>
    <section>
        <span class="pulse-mark" aria-hidden="true"><i></i><i></i><i></i></span>
        <h1>Welcome back</h1>
        <p>Owner password. No signup.</p>
        <form method="POST" use:enhance>
            <input class="username" name="username" value="counterscale" autocomplete="username" tabindex="-1" aria-hidden="true" />
            <label for="password">Password</label>
            <input bind:this={passwordInput} id="password" name="password" type="password" autocomplete="current-password" required aria-invalid={form?.invalid ? "true" : undefined} aria-describedby={form?.invalid ? "password-error" : undefined} />
            {#if form?.invalid}<small id="password-error" role="alert">Wrong password.</small>{/if}
            <button>Continue</button>
        </form>
        <footer>
            <a href={resolve("/")}>Back</a>
        </footer>
    </section>
</main>

<style>
    main {
        display: grid;
        min-height: 100vh;
        place-items: center;
        padding: 24px;
        background: var(--paper);
    }

    section {
        width: min(360px, 100%);
    }

    .pulse-mark { margin-bottom: 18px; }

    h1 {
        margin: 8px 0 8px;
        font-size: 1rem;
        font-weight: 500;
    }

    section > p {
        margin: 0 0 22px;
        color: var(--muted);
        font-size: 13px;
        font-weight: 400;
    }

    label {
        display: block;
        margin-bottom: 6px;
        color: var(--muted);
        font-size: 12px;
        font-weight: 400;
    }

    input {
        width: 100%;
        height: 40px;
        padding: 0 10px;
        border: 1px solid var(--line);
        border-radius: 8px;
        color: var(--ink);
        background: var(--paper);
        font-size: 13px;
        font-weight: 400;
    }

    input:focus {
        outline: 0;
        border-color: var(--ink);
    }

    input[aria-invalid="true"] { border-color: var(--ink); }

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
        color: var(--muted);
        font-size: 12px;
        font-weight: 400;
    }

    button {
        display: flex;
        width: 100%;
        height: 40px;
        align-items: center;
        justify-content: center;
        margin-top: 12px;
        border: 0;
        border-radius: 8px;
        color: var(--paper);
        background: var(--ink);
        font-size: 13px;
        font-weight: 400;
        cursor: pointer;
    }

    footer {
        margin-top: 16px;
        font-size: 12px;
    }

    footer a {
        color: var(--muted);
        font-weight: 400;
        text-decoration: none;
    }
</style>

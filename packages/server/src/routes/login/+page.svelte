<script lang="ts">
    import { enhance } from "$app/forms";
    import type { PageProps } from "./$types";

    let { form }: PageProps = $props();
</script>

<svelte:head><title>Sign in — Pulse</title></svelte:head>

<main>
    <form method="POST" use:enhance>
        <div class="mark"><i></i><i></i><i></i></div>
        <p>Private analytics</p>
        <h1>Sign in to Pulse</h1>
        <label>
            <span>Password</span>
            <input name="password" type="password" autocomplete="current-password" required />
        </label>
        {#if form?.invalid}<small>The password is incorrect.</small>{/if}
        <button>Continue</button>
    </form>
</main>

<style>
    main { display: grid; min-height: 100vh; place-items: center; padding: 20px; }
    form { width: min(360px, 100%); padding: 26px; border: 1px solid var(--line); border-radius: 12px; background: white; box-shadow: 0 18px 55px rgba(18, 27, 43, 0.08); }
    .mark { display: flex; align-items: end; width: 30px; height: 30px; gap: 2px; padding: 7px; border-radius: 8px; background: var(--ink); }
    .mark i { width: 3px; border-radius: 3px; background: white; }
    .mark i:nth-child(1) { height: 6px; opacity: .5; }
    .mark i:nth-child(2) { height: 13px; }
    .mark i:nth-child(3) { height: 9px; opacity: .75; }
    p { margin: 20px 0 3px; color: var(--muted); font-size: 9px; font-weight: 750; letter-spacing: .08em; text-transform: uppercase; }
    h1 { margin: 0 0 24px; font-size: 21px; letter-spacing: -.045em; }
    label, span { display: block; }
    span { margin-bottom: 7px; color: #4d596d; font-size: 10px; font-weight: 700; }
    input { width: 100%; height: 40px; border: 1px solid #ced8e6; border-radius: 7px; padding: 0 11px; color: var(--ink); background: #fbfcfe; font-size: 12px; }
    small { display: block; margin-top: 8px; color: #b33a3a; font-size: 9px; }
    button { width: 100%; height: 39px; margin-top: 13px; border: 0; border-radius: 7px; color: white; background: var(--ink); font-size: 10px; font-weight: 750; cursor: pointer; }
</style>

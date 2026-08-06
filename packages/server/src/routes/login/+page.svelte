<script lang="ts">
    import { enhance } from "$app/forms";
    import { onMount } from "svelte";
    import type { PageProps } from "./$types";

    let { form }: PageProps = $props();
    let passwordInput: HTMLInputElement;

    onMount(() => passwordInput.focus());
</script>

<svelte:head>
    <title>Sign in — Counterscale</title>
    <meta name="description" content="Enter your private Counterscale observatory." />
</svelte:head>

<main>
    <div class="preview" aria-hidden="true" inert>
        <header><div class="preview-frame"><span class="preview-brand"><i></i><b>Pulse</b></span><span class="preview-page-name">Analytics</span><div class="period">7D&nbsp;&nbsp; 14D&nbsp;&nbsp; 30D</div></div></header>
        <aside class="preview-rail"><i></i><i></i><i></i><i></i></aside>
        <div class="preview-page">
            <section class="preview-title"><div><small>COUNTERSCALE / FIELD NOTE 014</small><h2>Audience velocity,<br /><em>observed in quiet detail.</em></h2></div><p>LIVE OBSERVATION<br />PORTFOLIO · 7D</p></section>
            <section class="preview-metrics">{#each ["Unique visitors", "Page views", "Sessions", "Bounce rate"] as label, index}<div><span>{label}</span><strong>{["2,814", "4,672", "3,039", "38.0%"][index]}</strong><i></i></div>{/each}</section>
            <section class="preview-chart"><div><small>AUDIENCE VELOCITY / 01</small><h3>Visitors over time</h3></div><svg viewBox="0 0 900 220"><path class="grid" d="M0 40H900M0 90H900M0 140H900M0 190H900" />{#each [72,118,96,166,132,186,154,205,174,126,168,194,146,212] as value,index}<rect x={16+index*63} y={220-value} width="20" height={value} /><rect class="previous" x={38+index*63} y={220-value*.72} width="20" height={value*.72} />{/each}</svg></section>
        </div>
    </div>

    <div class="veil"></div>
    <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="login-title" aria-describedby="login-copy">
        <form method="POST" use:enhance>
            <div class="mark" aria-hidden="true"><i></i><i></i><i></i></div>
            <span class="kicker">Private observatory / Authorized access</span>
            <h1 id="login-title">Welcome<br /><em>back.</em></h1>
            <p id="login-copy">Enter the shared password to continue to your private analytics.</p>
            <input class="username" name="username" value="counterscale" autocomplete="username" tabindex="-1" aria-hidden="true" />
            <label for="password">Password</label>
            <input bind:this={passwordInput} id="password" name="password" type="password" autocomplete="current-password" required aria-invalid={form?.invalid ? "true" : undefined} aria-describedby={form?.invalid ? "password-error" : undefined} />
            {#if form?.invalid}<small id="password-error" role="alert">That password did not match. Please try again.</small>{/if}
            <button>Enter the observatory <span aria-hidden="true">→</span></button>
            <footer><i></i><span>Encrypted session · No public access</span></footer>
        </form>
    </div>
</main>

<style>
    :global(*) { box-sizing: border-box; }
    main { position: relative; min-height: 100vh; overflow: hidden; color: #171715; background: #eae6dc; font-family: "Plus Jakarta Sans Variable", system-ui, sans-serif; }
    .preview { min-height: 100vh; filter: saturate(.74); }
    .preview header { border-bottom: 1px solid #c8c1b5; }
    .preview-frame { display: flex; width: min(1160px, calc(100% - 48px)); min-height: 58px; margin: 0 auto; align-items: center; gap: 34px; }
    .preview-brand { display: flex; align-items: center; gap: 9px; margin-right: auto; font-family: "Instrument Serif", Georgia, serif; font-size: 19px; }.preview-brand i { width: 12px; height: 13px; border-left: 3px solid #7c2f35; border-right: 3px solid #7c2f35; }.preview-brand b { font-weight: 400; }
    .preview-page-name { margin-right: 4px; color: #74745a; font-family: "IBM Plex Mono", monospace; font-size: 8px; letter-spacing: .08em; text-transform: uppercase; }.period { border: 1px solid #c8c1b5; padding: 7px 10px; color: #74745a; font-family: "IBM Plex Mono", monospace; font-size: 8px; }
    .preview-rail { position: fixed; top: 50%; left: 24px; display: grid; gap: 6px; padding: 7px; border: 1px solid #c8c1b5; background: rgba(242,238,228,.82); transform: translateY(-50%); }.preview-rail i { width: 28px; height: 28px; border: 1px solid #c8c1b5; }.preview-rail i:first-child { background: #171715; }
    .preview-page { width: min(1160px, calc(100% - 48px)); margin: 0 auto; padding-top: 74px; }
    .preview-title { display: grid; grid-template-columns: 1fr auto; align-items: end; gap: 30px; padding-bottom: 38px; }.preview-title small,.preview-chart small { color: #74745a; font-family: "IBM Plex Mono", monospace; font-size: 8px; }.preview-title h2 { margin: 12px 0 0; font-family: "Instrument Serif", Georgia, serif; font-size: 58px; font-weight: 400; line-height: .98; letter-spacing: -.04em; }.preview-title em { color: #7c2f35; }.preview-title p { padding-left: 18px; border-left: 1px solid #c8c1b5; color: #74745a; font-family: "IBM Plex Mono", monospace; font-size: 8px; line-height: 1.7; }
    .preview-metrics { display: grid; grid-template-columns: repeat(4,1fr); border: 1px solid #c8c1b5; background: #f2eee4; }.preview-metrics div { padding: 22px; border-right: 1px solid #c8c1b5; }.preview-metrics div:last-child { border: 0; }.preview-metrics span { color: #74745a; font-family: "IBM Plex Mono", monospace; font-size: 8px; text-transform: uppercase; }.preview-metrics strong { display: block; margin: 12px 0; font-family: "Instrument Serif",Georgia,serif;font-size:40px;font-weight:400}.preview-metrics i{display:block;width:50%;height:2px;background:#7c2f35}
    .preview-chart { margin-top: 18px; padding: 28px; border: 1px solid #c8c1b5; background: #f2eee4; }.preview-chart h3{margin:8px 0 22px;font-family:"Instrument Serif",Georgia,serif;font-size:35px;font-weight:400}.preview-chart svg{display:block;width:100%;height:230px}.preview-chart .grid{fill:none;stroke:#c8c1b5;stroke-width:1}.preview-chart rect{fill:#7c2f35}.preview-chart rect.previous{fill:#a8a495}
    .veil { position: fixed; z-index: 1; inset: 0; background: rgba(234,230,220,.48); backdrop-filter: blur(4px); animation: veil-in 220ms ease-out both; }
    .dialog { position: fixed; z-index: 2; inset: 0; display: grid; place-items: center; padding: 22px; }
    form { width: min(390px, 100%); padding: 31px; border: 1px solid #aaa297; background: #f2eee4; box-shadow: 0 28px 90px rgba(31,24,20,.19); animation: dialog-in 240ms cubic-bezier(.22,1,.36,1) both; }
    .mark { display:flex;align-items:end;gap:3px;width:22px;height:20px;margin-bottom:26px}.mark i{width:4px;height:9px;background:#7c2f35}.mark i:nth-child(2){height:19px}.mark i:nth-child(3){height:14px}
    .kicker { display:block;margin-bottom:13px;color:#74745a;font-family:"IBM Plex Mono",monospace;font-size:8px;letter-spacing:.07em;text-transform:uppercase }
    h1 { margin:0;font-family:"Instrument Serif",Georgia,serif;font-size:54px;font-weight:400;line-height:.78;letter-spacing:-.045em }h1 em{color:#7c2f35;font-weight:400}
    form>p{max-width:290px;margin:24px 0 27px;color:#74745a;font-size:10px;line-height:1.65}
    label{display:block;margin-bottom:7px;color:#56534c;font-family:"IBM Plex Mono",monospace;font-size:8px;text-transform:uppercase}
    input{width:100%;height:44px;border:1px solid #bcb5aa;border-radius:0;padding:0 12px;color:#171715;background:#eae6dc;font-family:"IBM Plex Mono",monospace;font-size:12px;transition:border-color 150ms ease,box-shadow 150ms ease}input:focus{outline:0;border-color:#7c2f35;box-shadow:0 0 0 3px rgba(124,47,53,.11)}input[aria-invalid="true"]{border-color:#9d3838}
    .username{position:absolute;width:1px;height:1px;padding:0;border:0;clip:rect(0,0,0,0);overflow:hidden}
    form>small{display:block;margin-top:8px;color:#9d3838;font-size:9px;line-height:1.4}
    form>button{display:flex;width:100%;height:43px;align-items:center;justify-content:space-between;margin-top:13px;padding:0 14px;border:1px solid #171715;border-radius:0;color:#eae6dc;background:#171715;font-family:"IBM Plex Mono",monospace;font-size:8px;text-transform:uppercase;cursor:pointer;transition:background 150ms ease,transform 150ms ease}form>button:hover{background:#7c2f35;transform:translateY(-1px)}form>button:focus-visible{outline:2px solid #7c2f35;outline-offset:3px}
    form footer{display:flex;align-items:center;gap:7px;margin-top:20px;color:#74745a;font-family:"IBM Plex Mono",monospace;font-size:7px;text-transform:uppercase}form footer i{width:5px;height:5px;border-radius:50%;background:#657c5e}
    @keyframes veil-in{from{opacity:0}to{opacity:1}}@keyframes dialog-in{from{opacity:0;transform:translateY(8px) scale(.985)}to{opacity:1;transform:none}}
    @media(max-width:650px){.preview-page-name,.preview-rail{display:none}.preview-title{grid-template-columns:1fr}.preview-title p{display:none}.preview-title h2{font-size:44px}.preview-metrics{grid-template-columns:1fr 1fr}.preview-metrics div:nth-child(2){border-right:0}.preview-metrics div:nth-child(-n+2){border-bottom:1px solid #c8c1b5}form{padding:27px}}
    @media(prefers-reduced-motion:reduce){.veil,form{animation:none}input,form>button{transition:none}}
</style>

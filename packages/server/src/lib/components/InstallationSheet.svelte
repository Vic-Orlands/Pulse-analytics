<script lang="ts">
    import { onMount } from "svelte";
    import Copy from "phosphor-svelte/lib/Copy";
    import Check from "phosphor-svelte/lib/Check";
    import X from "phosphor-svelte/lib/X";
    import { frameworkGuides, htmlSnippet, SAMPLE_SITE_ID } from "$lib/install-snippets";

    let { open, onclose }: { open: boolean; onclose: () => void } = $props();
    let origin = $state("https://analytics.example.com");
    let copied = $state("");
    let framework = $state("html");
    let closeButton = $state<HTMLButtonElement>();

    const guides = $derived(frameworkGuides(origin, SAMPLE_SITE_ID));
    const selected = $derived(guides.find((guide) => guide.id === framework) ?? guides[0]);
    const sample = $derived(htmlSnippet(origin, SAMPLE_SITE_ID));
    const eventExample = [
        "window.counterscale.trackEvent({",
        '  type: "copy",',
        '  name: "install-snippet",',
        '  target: "/docs/install · pre",',
        '  value: "pnpm add @counterscale/tracker"',
        "});",
    ].join("\n");

    async function copy(label: string, value: string) {
        await navigator.clipboard.writeText(value);
        copied = label;
        window.setTimeout(() => (copied = ""), 1600);
    }

    function handleKeydown(event: KeyboardEvent) {
        if (!open) return;
        if (event.key === "Escape") onclose();
        if (event.key !== "Tab") return;
        const dialog = closeButton?.closest("[role=dialog]");
        const focusable = Array.from(dialog?.querySelectorAll<HTMLElement>('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? []).filter((element) => !element.hasAttribute("disabled"));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    onMount(() => { origin = window.location.origin; });
    $effect(() => { if (open) window.setTimeout(() => closeButton?.focus(), 20); });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
    <button class="fixed inset-0 z-[70] cursor-default border-0 bg-[color-mix(in_srgb,var(--ink)_25%,transparent)]" aria-label="Close install" onclick={onclose}></button>
    <div class="fixed inset-y-3 right-3 z-[80] w-[min(680px,calc(100%-24px))] overflow-y-auto rounded-lg bg-[var(--panel)] text-sm text-[var(--ink)] ring-1 ring-[var(--line)] max-[600px]:inset-x-2 max-[600px]:top-2 max-[600px]:bottom-[86px] max-[600px]:w-auto" role="dialog" aria-modal="true" aria-labelledby="installation-title">
        <header class="sticky top-0 z-[2] flex items-start justify-between border-b border-[var(--line)] bg-[var(--panel)] p-6">
            <div>
                <span class="kicker">Install</span>
                <h2 class="mt-2 text-lg font-medium tracking-[-.02em]" id="installation-title">Add tracking</h2>
            </div>
            <button class="grid size-9 cursor-pointer place-items-center rounded-lg border border-[var(--line)] bg-transparent text-[var(--ink)]" bind:this={closeButton} onclick={onclose} aria-label="Close install"><X size={17} weight="fill" /></button>
        </header>

        <p class="m-0 px-6 py-6 text-sm leading-6 text-[var(--muted)]">
            Paste this into your app. Keep <code class="text-[var(--ink)]">id="counterscale-script"</code> and set <code class="text-[var(--ink)]">data-site-id</code>. First pageview creates the app.
        </p>

        <div class="mx-6 mb-6 flex justify-between gap-5 border-y border-[var(--line)] py-3">
            <span class="text-xs font-medium uppercase tracking-[.04em] text-[var(--muted)]">Endpoint</span>
            <code class="overflow-hidden text-ellipsis text-xs text-[var(--ink)]">{origin}/collect</code>
        </div>

        <article class="relative mx-6 mb-6 border-y border-[var(--line)] p-4">
            <header class="flex items-center gap-3">
                <span class="text-xs text-[var(--muted)]">01</span>
                <strong class="text-xs font-medium">Snippet</strong>
            </header>
            <p class="mt-3 text-xs leading-5 text-[var(--muted)]">Replace <code class="text-[var(--ink)]">{SAMPLE_SITE_ID}</code> with a short name. Hostname is used if you omit <code class="text-[var(--ink)]">data-site-id</code>.</p>
            <pre class="my-4 overflow-x-auto bg-[color-mix(in_srgb,var(--ink)_3%,transparent)] p-3 text-xs leading-5 whitespace-pre-wrap text-[var(--muted)] break-words">{sample}</pre>
            <button class="flex cursor-pointer items-center gap-2 border border-[var(--line)] bg-transparent px-3 py-2 text-xs font-medium uppercase text-[var(--ink)]" onclick={() => copy("sample", sample)}>
                {#if copied === "sample"}<Check size={14} weight="fill" />{:else}<Copy size={14} weight="fill" />{/if}{copied === "sample" ? "Copied" : "Copy"}
            </button>
        </article>

        <section class="px-6 pb-2">
            <span class="text-xs font-medium uppercase tracking-[.04em] text-[var(--muted)]">Where</span>
            <h3 class="mt-2 text-lg font-medium">Frameworks</h3>
            <div class="mt-4 flex flex-wrap" aria-label="Framework">
                {#each guides as guide (guide.id)}
                    <button class="min-w-[72px] cursor-pointer border-0 px-3 py-2 text-xs font-medium uppercase text-[var(--muted)] ring-1 ring-[var(--line)] {framework === guide.id ? 'bg-[var(--ink)] text-[var(--paper)]' : 'bg-transparent'}" onclick={() => (framework = guide.id)} aria-pressed={framework === guide.id}>{guide.label}</button>
                {/each}
            </div>
            {#if selected}
                <p class="mt-4 text-xs leading-6 text-[var(--muted)]"><strong class="text-[var(--ink)] font-medium">{selected.file}</strong> — {selected.hint}</p>
                <pre class="my-4 overflow-x-auto bg-[color-mix(in_srgb,var(--ink)_3%,transparent)] p-3 text-xs leading-5 whitespace-pre-wrap text-[var(--muted)] break-words">{selected.code}</pre>
                <button class="flex cursor-pointer items-center gap-2 border border-[var(--line)] bg-transparent px-3 py-2 text-xs font-medium uppercase text-[var(--ink)]" onclick={() => copy(selected.id, selected.code)}>
                    {#if copied === selected.id}<Check size={14} weight="fill" />{:else}<Copy size={14} weight="fill" />{/if}{copied === selected.id ? "Copied" : `Copy ${selected.label}`}
                </button>
            {/if}
        </section>

        <section class="m-6 border-t border-[var(--line)] pt-6">
            <span class="text-xs font-medium uppercase tracking-[.04em] text-[var(--muted)]">Events</span>
            <h3 class="mt-2 text-lg font-medium">Custom events</h3>
            <p class="mt-3 text-xs leading-5 text-[var(--muted)]">Copy, outbound clicks, and downloads are automatic. Use this for extra events.</p>
            <pre class="mt-4 overflow-x-auto bg-[color-mix(in_srgb,var(--ink)_3%,transparent)] p-3 text-xs leading-5 whitespace-pre-wrap text-[var(--muted)] break-words">{eventExample}</pre>
        </section>
        <span class="sr-only" aria-live="polite">{copied ? `Copied ${copied}` : ""}</span>
    </div>
{/if}

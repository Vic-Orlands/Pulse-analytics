<script lang="ts">
    import { onMount } from "svelte";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import { Cancel01Icon, Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
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
    <button class="fixed inset-0 z-[70] cursor-default border-0 bg-[color-mix(in_srgb,var(--ink)_25%,transparent)]" aria-label="Close tracking installations" onclick={onclose}></button>
    <div class="fixed inset-y-3 right-3 z-[80] w-[min(680px,calc(100%-24px))] overflow-y-auto rounded-2xl bg-[var(--panel)] text-sm text-[var(--ink)] shadow-[var(--shadow)] ring-1 ring-[var(--line)] max-[600px]:inset-x-2 max-[600px]:top-2 max-[600px]:bottom-[86px] max-[600px]:w-auto" role="dialog" aria-modal="true" aria-labelledby="installation-title">
        <header class="sticky top-0 z-[2] flex items-start justify-between border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--panel)_94%,transparent)] p-6 backdrop-blur-xl">
            <div>
                <span class="kicker">Collector setup</span>
                <h2 class="mt-2 text-lg font-semibold tracking-[-.02em]" id="installation-title">Add Pulse to any app</h2>
            </div>
            <button class="grid size-9 cursor-pointer place-items-center rounded-xl border-0 bg-transparent text-[var(--ink)] shadow-[0_0_0_1px_var(--line)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]" bind:this={closeButton} onclick={onclose} aria-label="Close tracking installations"><HugeiconsIcon icon={Cancel01Icon} size={17} strokeWidth={1.6} /></button>
        </header>

        <p class="m-0 px-6 py-6 text-sm leading-6 text-[var(--muted)]">
            This is a sample for any application — not a list of apps already in Pulse. Paste the snippet into the app shell, keep <code class="text-[var(--ink)]">id="counterscale-script"</code>, and choose a stable <code class="text-[var(--ink)]">data-site-id</code>. The first pageview creates that app in Pulse automatically.
        </p>

        <div class="mx-6 mb-6 flex justify-between gap-5 border-y border-[var(--line)] py-3">
            <span class="text-xs font-medium uppercase tracking-[.04em] text-[var(--muted)]">Endpoint</span>
            <code class="overflow-hidden text-ellipsis text-xs text-[var(--accent)]">{origin}/collect</code>
        </div>

        <article class="relative mx-6 mb-6 border-y border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_56%,transparent)] p-4 before:absolute before:-inset-y-2 before:left-0 before:w-px before:bg-[var(--line)] after:absolute after:-inset-y-2 after:right-0 after:w-px after:bg-[var(--line)]">
            <header class="flex items-center gap-3">
                <span class="text-xs text-[var(--muted)]">01</span>
                <strong class="text-xs font-medium">Sample snippet</strong>
                <i class="ml-auto size-1.5 rounded-full bg-[var(--accent)]"></i>
            </header>
            <p class="mt-3 text-xs leading-5 text-[var(--muted)]">Replace <code class="text-[var(--ink)]">{SAMPLE_SITE_ID}</code> with a short name for the product. If you omit <code class="text-[var(--ink)]">data-site-id</code>, Pulse uses the hostname instead.</p>
            <pre class="my-4 overflow-x-auto bg-[color-mix(in_srgb,var(--ink)_3%,transparent)] p-3 text-xs leading-5 whitespace-pre-wrap text-[var(--muted)] break-words">{sample}</pre>
            <button class="flex cursor-pointer items-center gap-2 border-0 bg-transparent px-3 py-2 text-xs font-medium uppercase text-[var(--ink)] shadow-[0_0_0_1px_var(--line)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]" onclick={() => copy("sample", sample)}>
                <HugeiconsIcon icon={copied === "sample" ? Tick02Icon : Copy01Icon} size={14} strokeWidth={1.7} />{copied === "sample" ? "Copied" : "Copy snippet"}
            </button>
        </article>

        <section class="px-6 pb-2">
            <span class="text-xs font-medium uppercase tracking-[.04em] text-[var(--muted)]">Where to add it</span>
            <h3 class="mt-2 text-lg font-semibold">Framework shells</h3>
            <div class="mt-4 flex flex-wrap" aria-label="Framework">
                {#each guides as guide (guide.id)}
                    <button class="min-w-[72px] cursor-pointer border-0 px-3 py-2 text-xs font-medium uppercase text-[var(--muted)] shadow-[0_0_0_1px_var(--line)] {framework === guide.id ? 'bg-[var(--ink)] text-[var(--paper)]' : 'bg-transparent'}" onclick={() => (framework = guide.id)} aria-pressed={framework === guide.id}>{guide.label}</button>
                {/each}
            </div>
            {#if selected}
                <p class="mt-4 text-xs leading-6 text-[var(--muted)]"><strong class="text-[var(--ink)]">{selected.file}</strong> — {selected.hint}</p>
                <pre class="my-4 overflow-x-auto bg-[color-mix(in_srgb,var(--ink)_3%,transparent)] p-3 text-xs leading-5 whitespace-pre-wrap text-[var(--muted)] break-words">{selected.code}</pre>
                <button class="flex cursor-pointer items-center gap-2 border-0 bg-transparent px-3 py-2 text-xs font-medium uppercase text-[var(--ink)] shadow-[0_0_0_1px_var(--line)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]" onclick={() => copy(selected.id, selected.code)}>
                    <HugeiconsIcon icon={copied === selected.id ? Tick02Icon : Copy01Icon} size={14} strokeWidth={1.7} />{copied === selected.id ? "Copied" : `Copy ${selected.label} snippet`}
                </button>
            {/if}
        </section>

        <section class="m-6 border-t border-[var(--line)] pt-6">
            <span class="text-xs font-medium uppercase tracking-[.04em] text-[var(--muted)]">Custom signals</span>
            <h3 class="mt-2 text-lg font-semibold">Declare meaningful events</h3>
            <p class="mt-3 text-xs leading-5 text-[var(--muted)]">Copy, outbound clicks, downloads, and screenshots are recorded automatically. Use this only for extra product events.</p>
            <pre class="mt-4 overflow-x-auto bg-[color-mix(in_srgb,var(--ink)_3%,transparent)] p-3 text-xs leading-5 whitespace-pre-wrap text-[var(--muted)] break-words">{eventExample}</pre>
        </section>
        <span class="sr-only" aria-live="polite">{copied ? `Snippet copied for ${copied}` : ""}</span>
    </div>
{/if}

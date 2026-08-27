<script lang="ts">
    import { onMount } from "svelte";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import { Cancel01Icon, Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";

    let { open, sites, onclose }: { open: boolean; sites: string[]; onclose: () => void } = $props();
    let origin = $state("https://analytics.example.com");
    let copied = $state("");
    let closeButton = $state<HTMLButtonElement>();

    const snippet = (site: string) => `<script id="counterscale-script" data-site-id="${site}" src="${origin}/tracker.js" defer><\/script>`;
    const eventExample = [
        "window.counterscale.trackEvent({",
        '  type: "copy",',
        '  name: "install-snippet",',
        '  target: "/docs/install · pre",',
        '  value: "pnpm add @counterscale/tracker"',
        "});",
    ].join("\n");

    async function copy(site: string) {
        await navigator.clipboard.writeText(snippet(site));
        copied = site;
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
    <div class="fixed inset-y-3 right-3 z-[80] w-[min(620px,calc(100%-24px))] overflow-y-auto bg-[var(--panel)] text-xs text-[var(--ink)] shadow-[0_0_0_1px_var(--line),-28px_0_90px_color-mix(in_srgb,var(--ink)_18%,transparent)] max-[600px]:inset-x-2 max-[600px]:top-2 max-[600px]:bottom-[74px] max-[600px]:w-auto" role="dialog" aria-modal="true" aria-labelledby="installation-title">
        <header class="sticky top-0 z-[2] flex items-start justify-between border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--panel)_94%,transparent)] p-6 backdrop-blur-xl"><div><span class="font-mono text-xs uppercase tracking-[.07em] text-[var(--muted)]">Collector setup</span><h2 class="mt-2 font-serif text-4xl font-normal tracking-[-.035em]" id="installation-title">Tracking installations</h2></div><button class="grid size-9 cursor-pointer place-items-center border-0 bg-transparent text-[var(--ink)] shadow-[0_0_0_1px_var(--line)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]" bind:this={closeButton} onclick={onclose} aria-label="Close tracking installations"><HugeiconsIcon icon={Cancel01Icon} size={17} strokeWidth={1.6} /></button></header>
        <p class="m-0 px-6 py-6 text-xs leading-6 text-[var(--muted)]">Install one snippet in each application shell. Page views, route changes, copy actions, and declared custom events will flow into Pulse.</p>
        <div class="mx-6 mb-6 flex justify-between gap-5 border-y border-[var(--line)] py-3"><span class="font-mono text-xs uppercase tracking-[.07em] text-[var(--muted)]">Endpoint</span><code class="overflow-hidden text-ellipsis font-mono text-xs text-[var(--accent)]">{origin}/collect</code></div>
        <div class="grid gap-6 px-6">
            {#each sites as site, index}
                <article class="relative border-y border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_56%,transparent)] p-4 before:absolute before:-inset-y-2 before:left-0 before:w-px before:bg-[var(--line)] after:absolute after:-inset-y-2 after:right-0 after:w-px after:bg-[var(--line)]">
                    <header class="flex items-center gap-3"><span class="font-mono text-xs text-[var(--muted)]">{String(index + 1).padStart(2, "0")}</span><strong class="text-xs font-medium capitalize">{site}</strong><i class="ml-auto size-1.5 rounded-full bg-[var(--accent)]"></i></header>
                    <pre class="my-4 overflow-x-auto bg-[color-mix(in_srgb,var(--ink)_3%,transparent)] p-3 font-mono text-xs leading-5 whitespace-pre-wrap text-[var(--muted)] break-words">{snippet(site)}</pre>
                    <button class="flex cursor-pointer items-center gap-2 border-0 bg-transparent px-3 py-2 font-mono text-xs uppercase text-[var(--ink)] shadow-[0_0_0_1px_var(--line)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]" onclick={() => copy(site)}><HugeiconsIcon icon={copied === site ? Tick02Icon : Copy01Icon} size={14} strokeWidth={1.7} />{copied === site ? "Copied" : "Copy snippet"}</button>
                </article>
            {/each}
        </div>
        <section class="m-6 border-t border-[var(--line)] pt-6"><span class="font-mono text-xs uppercase tracking-[.07em] text-[var(--muted)]">Custom signals</span><h3 class="mt-2 font-serif text-3xl font-normal">Declare meaningful events</h3><pre class="mt-4 overflow-x-auto bg-[color-mix(in_srgb,var(--ink)_3%,transparent)] p-3 font-mono text-xs leading-5 whitespace-pre-wrap text-[var(--muted)] break-words">{eventExample}</pre></section>
        <span class="sr-only" aria-live="polite">{copied ? `Snippet copied for ${copied}` : ""}</span>
    </div>
{/if}

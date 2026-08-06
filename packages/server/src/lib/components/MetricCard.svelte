<script lang="ts">
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";

    let {
        label,
        value,
        detail,
        tone = "blue",
    }: { label: string; value: string; detail: string; tone?: "blue" | "mint" | "amber" | "ink" } = $props();
</script>

<article class="metric" data-tone={tone} data-reveal>
    <div class="metric-head">
        <span>{label}</span>
        <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} strokeWidth={1.7} />
    </div>
    <strong class="mono">{value}</strong>
    <small>{detail}</small>
</article>

<style>
    .metric {
        min-width: 0;
        padding: 15px 16px 14px;
        border: 1px solid var(--line);
        border-top: 2px solid var(--accent, var(--blue));
        border-radius: 10px;
        background: color-mix(in srgb, var(--panel) 96%, var(--accent));
        box-shadow: 0 1px 2px rgba(18, 27, 43, 0.04);
    }

    .metric[data-tone="mint"] { --accent: var(--mint); }
    .metric[data-tone="amber"] { --accent: var(--amber); }
    .metric[data-tone="ink"] { --accent: var(--ink); }

    .metric-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: var(--muted);
        font-size: 11px;
        font-weight: 650;
        letter-spacing: 0.02em;
    }

    strong {
        display: block;
        margin-top: 17px;
        font-size: clamp(24px, 3vw, 32px);
        line-height: 1;
        letter-spacing: -0.055em;
    }

    small {
        display: block;
        margin-top: 8px;
        color: var(--muted);
        font-size: 10px;
    }
</style>

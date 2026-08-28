<script lang="ts">
    let {
        label,
        value,
        detail,
    }: { label: string; value: string; detail: string } = $props();
</script>

<article class="panel metric">
    <span class="kicker">{label}</span>
    <strong class="serif">{value}</strong>
    <small>{detail}</small>
</article>

<style>
    .metric { min-width: 0; padding: 18px; }
    strong { display: block; margin: 14px 0 8px; font-size: clamp(28px, 3vw, 36px); line-height: 1; letter-spacing: -0.04em; }
    small { color: var(--muted); font-size: 12px; }
</style>

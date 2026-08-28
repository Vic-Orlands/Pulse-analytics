<script lang="ts">
    let {
        label,
        value,
        detail,
    }: { label: string; value: string; detail: string } = $props();
</script>

<article class="panel metric">
    <span class="kicker">{label}</span>
    <strong>{value}</strong>
    <small>{detail}</small>
</article>

<style>
    .metric { min-width: 0; padding: 18px; }
    strong { display: block; margin: 14px 0 8px; font-size: var(--text-lg); font-weight: 500; line-height: 1.3; letter-spacing: -0.02em; }
    small { color: var(--muted); font-size: 12px; }
</style>

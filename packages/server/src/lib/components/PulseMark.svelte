<script lang="ts">
    import ChartBar from "phosphor-svelte/lib/ChartBar";

    let { size = 18 }: { size?: number } = $props();
</script>

<ChartBar {size} weight="fill" />

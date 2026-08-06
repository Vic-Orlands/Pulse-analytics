<script lang="ts">
    import { AreaChart } from "layerchart";
    import type { TrafficPoint } from "$lib/types";

    let { data }: { data: TrafficPoint[] } = $props();
</script>

<div class="chart" aria-label="Traffic over time">
    <AreaChart
        {data}
        x="date"
        series={[
            { key: "views", label: "Page views", color: "#246bfe" },
            { key: "visitors", label: "Visitors", color: "#19a974" },
        ]}
        seriesLayout="overlap"
        height={276}
        padding={{ left: 34, right: 12, top: 18, bottom: 26 }}
        yDomain={[0, null]}
        yNice
        axis
        legend={false}
    />
</div>

<style>
    .chart {
        min-height: 276px;
        color: var(--muted);
        font-family: "IBM Plex Mono", monospace;
        font-size: 9px;
    }

    :global(.lc-area-path) {
        fill-opacity: 0.11;
        stroke-width: 1.8;
    }
</style>

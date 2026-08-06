<script lang="ts">
    import { onMount } from "svelte";
    import type { TrafficPoint } from "$lib/types";
    import type { ThemeId } from "$lib/theme";

    let {
        data,
        theme,
        mode = "bar",
    }: {
        data: TrafficPoint[];
        theme: ThemeId;
        mode?: "bar" | "area";
    } = $props();

    let activeIndex = $state<number | null>(null);
    let compactViewport = $state(false);

    const width = $derived(compactViewport ? 540 : 1000);
    const height = 300;
    const left = 48;
    const right = 18;
    const top = 18;
    const bottom = 258;
    const plotWidth = $derived(width - left - right);
    const plotHeight = bottom - top;

    const points = $derived(data.map((point) => ({
        ...point,
        previous: point.previousVisitors,
    })));
    const maxValue = $derived(Math.max(...points.flatMap((point) => [point.visitors, point.previous]), 1));
    const totalVisitors = $derived(points.reduce((total, point) => total + point.visitors, 0));
    const totalPrevious = $derived(points.reduce((total, point) => total + point.previous, 0));

    function xAt(index: number) {
        return points.length <= 1 ? left + plotWidth / 2 : left + (index / (points.length - 1)) * plotWidth;
    }

    function yAt(value: number) {
        return bottom - (value / maxValue) * plotHeight;
    }

    function linePath(key: "visitors" | "previous") {
        if (!points.length) return "";
        if (points.length === 1) return `M${xAt(0)} ${yAt(points[0][key])}`;
        const coordinates = points.map((point, index) => [xAt(index), yAt(point[key])] as const);
        return coordinates.reduce((path, point, index) => {
            if (index === 0) return `M${point[0].toFixed(2)} ${point[1].toFixed(2)}`;
            const previous = coordinates[index - 1];
            const before = coordinates[index - 2] ?? previous;
            const after = coordinates[index + 1] ?? point;
            const controlOneX = previous[0] + (point[0] - before[0]) / 6;
            const controlOneY = previous[1] + (point[1] - before[1]) / 6;
            const controlTwoX = point[0] - (after[0] - previous[0]) / 6;
            const controlTwoY = point[1] - (after[1] - previous[1]) / 6;
            return `${path} C${controlOneX.toFixed(2)} ${controlOneY.toFixed(2)}, ${controlTwoX.toFixed(2)} ${controlTwoY.toFixed(2)}, ${point[0].toFixed(2)} ${point[1].toFixed(2)}`;
        }, "");
    }

    function areaPath(key: "visitors" | "previous") {
        if (!points.length) return "";
        return `${linePath(key)} L${xAt(points.length - 1)} ${bottom} L${xAt(0)} ${bottom} Z`;
    }

    function formatDate(value: Date) {
        return new Date(value).toLocaleDateString("en", { month: "short", day: "2-digit" });
    }

    const growth = $derived(totalPrevious > 0 ? ((totalVisitors - totalPrevious) / totalPrevious) * 100 : 0);

    onMount(() => {
        const media = window.matchMedia("(max-width: 640px)");
        const sync = () => (compactViewport = media.matches);
        sync();
        media.addEventListener("change", sync);
        return () => media.removeEventListener("change", sync);
    });
</script>

<figure class="m-0 font-mono text-xs text-[var(--muted)]" data-theme-chart={theme} data-mode={mode}>
    <div class="relative">
        <svg class="block h-auto w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="traffic-title traffic-description">
            <title id="traffic-title">Daily visitor velocity</title>
            <desc id="traffic-description">{totalVisitors.toLocaleString()} visitors, {growth.toFixed(1)} percent above the comparison period.</desc>
            <defs>
                <linearGradient id="current-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stop-color="var(--accent)" stop-opacity="0.62" />
                    <stop offset="95%" stop-color="var(--accent)" stop-opacity="0.035" />
                </linearGradient>
                <linearGradient id="previous-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stop-color="var(--comparison)" stop-opacity="0.36" />
                    <stop offset="95%" stop-color="var(--comparison)" stop-opacity="0.015" />
                </linearGradient>
            </defs>

            <g>
                {#each [0, 0.25, 0.5, 0.75, 1] as ratio}
                    <path class="fill-none stroke-[var(--line)] stroke-1" d={`M${left} ${bottom - ratio * plotHeight}H${width - right}`} />
                    <text class="fill-[var(--muted)] text-xs tracking-[.03em]" x="0" y={bottom - ratio * plotHeight + 4}>{Math.round(maxValue * ratio)}</text>
                {/each}
            </g>

            {#if mode === "bar"}
                <g>
                    {#each points as point, index}
                        {@const slot = plotWidth / Math.max(points.length, 1)}
                        {@const barWidth = Math.min(24, Math.max(6, slot * 0.26))}
                        <rect class="fill-[var(--comparison)] opacity-60" x={xAt(index) - barWidth - 1} y={yAt(point.previous)} width={barWidth} height={bottom - yAt(point.previous)} />
                        <rect class="fill-[var(--accent)]" x={xAt(index) + 1} y={yAt(point.visitors)} width={barWidth} height={bottom - yAt(point.visitors)} />
                    {/each}
                </g>
            {:else}
                <g>
                    <path class="fill-[url(#previous-fill)] stroke-[var(--comparison)] stroke-[1.25] [stroke-dasharray:4_4] [stroke-linecap:round] [stroke-linejoin:round]" d={areaPath("previous")} />
                    <path class="fill-[url(#current-fill)] stroke-[var(--accent)] stroke-2 [stroke-linecap:round] [stroke-linejoin:round]" d={areaPath("visitors")} />
                </g>
            {/if}

            <g>
                {#each points as point, index}
                    {#if index === 0 || index === points.length - 1 || index === Math.floor(points.length / 2)}
                        <text class="fill-[var(--muted)] text-xs tracking-[.03em]" x={xAt(index)} y="286" text-anchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"}>{formatDate(point.date)}</text>
                    {/if}
                {/each}
            </g>

            <g>
                {#each points as point, index}
                    {@const zoneWidth = plotWidth / Math.max(points.length, 1)}
                    <rect
                        class="fill-transparent pointer-events-auto"
                        role="presentation"
                        x={xAt(index) - zoneWidth / 2}
                        y={top}
                        width={zoneWidth}
                        height={plotHeight}
                        onmouseenter={() => (activeIndex = index)}
                        onmouseleave={() => (activeIndex = null)}
                    />
                {/each}
            </g>
        </svg>

        {#if activeIndex !== null && points[activeIndex]}
            {@const point = points[activeIndex]}
            <div class="pointer-events-none absolute top-4 z-[2] grid min-w-40 -translate-x-1/2 gap-2 bg-[var(--ink)] p-3 text-xs text-[var(--paper)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent)_35%,transparent)]" style={`left:clamp(80px, ${(xAt(activeIndex) / width) * 100}%, calc(100% - 80px))`}>
                <strong class="font-serif text-base font-normal italic">{formatDate(point.date)}</strong>
                <span class="flex justify-between gap-4 text-[color-mix(in_srgb,var(--paper)_70%,transparent)]">Visitors <b class="font-medium text-[var(--paper)]">{point.visitors.toLocaleString()}</b></span>
                <span class="flex justify-between gap-4 text-[color-mix(in_srgb,var(--paper)_70%,transparent)]">Previous <b class="font-medium text-[var(--paper)]">{point.previous.toLocaleString()}</b></span>
                <span class="flex justify-between gap-4 text-[color-mix(in_srgb,var(--paper)_70%,transparent)]">Page views <b class="font-medium text-[var(--paper)]">{point.views.toLocaleString()}</b></span>
            </div>
        {/if}
    </div>

    <figcaption class="mt-3 flex flex-wrap items-center gap-5 border-t border-[var(--line)] pt-3 text-xs uppercase">
        <span class="flex items-center gap-2"><i class="h-2 w-4 bg-[var(--accent)]"></i>Current window</span>
        <span class="flex items-center gap-2"><i class="h-2 w-4 bg-[var(--comparison)]"></i>Previous window</span>
        <strong class="ml-auto font-medium text-[var(--ink)] max-sm:ml-0 max-sm:w-full">{growth >= 0 ? "+" : ""}{growth.toFixed(1)}% audience shift</strong>
    </figcaption>
</figure>

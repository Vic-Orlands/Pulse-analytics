<script lang="ts">
    import { onMount } from "svelte";
    import IconContext from "phosphor-svelte/lib/IconContext";
    import "../app.css";
    import { appearance } from "$lib/appearance.svelte";

    let { children } = $props();

    onMount(() => appearance.hydrate());
</script>

<IconContext values={{ weight: "fill" }}>
    {@render children()}
</IconContext>

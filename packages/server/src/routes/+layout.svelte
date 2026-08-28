<script lang="ts">
    import { onMount } from "svelte";
    import "../app.css";
    import { appearance } from "$lib/appearance.svelte";

    let { children } = $props();

    onMount(() => appearance.hydrate());
</script>

{@render children()}

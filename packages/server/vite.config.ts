import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { sveltePhosphorOptimize } from "phosphor-svelte/vite";
import { defineConfig } from "vite";

export default defineConfig({
    server: { port: 3005 },
    plugins: [sveltePhosphorOptimize(), tailwindcss(), sveltekit()],
});


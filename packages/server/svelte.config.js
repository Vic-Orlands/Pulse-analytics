import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default {
    preprocess: vitePreprocess(),
    kit: {
        adapter: adapter({ config: "wrangler.build.json" }),
        alias: {
            $legacy: "./app",
            "~": "./app",
        },
    },
};

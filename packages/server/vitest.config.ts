import { defineConfig, coverageConfigDefaults } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    test: {
        pool: "forks",
        include: [
            "app/analytics/__tests__/collect.events.test.ts",
            "app/analytics/__tests__/query.test.ts",
            "app/analytics/__tests__/worker-collect.test.ts",
            "src/**/*.test.ts",
        ],
        coverage: {
            provider: "v8",
            exclude: [
                "build",
                "tailwind.config.ts",
                "public/tracker.js",
                ...coverageConfigDefaults.exclude,
            ],
        },
    },
    resolve: {
        alias: {
            "~": new URL("./app", import.meta.url).pathname,
            $lib: new URL("./src/lib", import.meta.url).pathname,
        },
    },
    plugins: [tsconfigPaths()],
});

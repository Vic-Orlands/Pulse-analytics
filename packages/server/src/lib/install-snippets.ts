export const TRACKER_VERSION = "3.5.0";
export const SAMPLE_SITE_ID = "your-app";

export function htmlSnippet(origin: string, siteId = SAMPLE_SITE_ID): string {
    const src = `${origin.replace(/\/$/, "")}/tracker.js?v=${TRACKER_VERSION}`;
    return `<script id="counterscale-script" data-site-id="${siteId}" src="${src}" defer></script>`;
}

export type FrameworkGuide = {
    id: string;
    label: string;
    file: string;
    hint: string;
    code: string;
};

export function frameworkGuides(origin: string, siteId = SAMPLE_SITE_ID): FrameworkGuide[] {
    const src = `${origin.replace(/\/$/, "")}/tracker.js?v=${TRACKER_VERSION}`;
    const html = htmlSnippet(origin, siteId);

    return [
        {
            id: "html",
            label: "HTML",
            file: "index.html",
            hint: "Before </body>.",
            code: html,
        },
        {
            id: "nextjs",
            label: "Next.js",
            file: "app/layout.tsx",
            hint: "Root App Router layout. Pages Router: _document or _app.",
            code: `import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          id="counterscale-script"
          src="${src}"
          strategy="afterInteractive"
          data-site-id="${siteId}"
        />
      </body>
    </html>
  );
}`,
        },
        {
            id: "react",
            label: "React",
            file: "index.html",
            hint: "HTML shell, not a routed component.",
            code: `<!-- public/index.html or index.html, before </body> -->
${html}`,
        },
        {
            id: "sveltekit",
            label: "SvelteKit",
            file: "src/app.html",
            hint: "app.html so it survives navigation.",
            code: `<!-- src/app.html, before </body> -->
${html}`,
        },
        {
            id: "solid",
            label: "Solid",
            file: "index.html",
            hint: "index.html shell.",
            code: `<!-- index.html, before </body> -->
${html}`,
        },
        {
            id: "vue",
            label: "Vue",
            file: "index.html",
            hint: "Vite index.html or Nuxt app.html.",
            code: `<!-- index.html, before </body> -->
${html}`,
        },
        {
            id: "astro",
            label: "Astro",
            file: "src/layouts/Layout.astro",
            hint: "Base layout. Keep is:inline.",
            code: `<!-- src/layouts/Layout.astro -->
<script is:inline id="counterscale-script" data-site-id="${siteId}" src="${src}" defer></script>`,
        },
    ];
}

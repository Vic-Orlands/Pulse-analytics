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
            hint: "Paste once before the closing body tag of every page you want to measure. The first pageview creates the app in Pulse.",
            code: html,
        },
        {
            id: "nextjs",
            label: "Next.js",
            file: "app/layout.tsx",
            hint: "Add the script in the App Router root layout so it loads on every route. For Pages Router, put the same Script tag in pages/_document.tsx or pages/_app.tsx.",
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
            hint: "For Vite, CRA, or any SPA, add the snippet to the HTML shell rather than a routed component so it is not remounted on navigation.",
            code: `<!-- public/index.html or index.html, before </body> -->
${html}`,
        },
        {
            id: "sveltekit",
            label: "SvelteKit",
            file: "src/app.html",
            hint: "Put the snippet in the application HTML shell so it survives client-side navigations. SvelteKit already tracks route changes through History.",
            code: `<!-- src/app.html, before </body> -->
${html}`,
        },
        {
            id: "solid",
            label: "Solid",
            file: "index.html",
            hint: "Add it to the SolidStart or Vite index.html shell, not inside a reactive component.",
            code: `<!-- index.html, before </body> -->
${html}`,
        },
        {
            id: "vue",
            label: "Vue",
            file: "index.html",
            hint: "Use the Vite index.html (or Nuxt app.html) so the collector is present before the Vue app hydrates.",
            code: `<!-- index.html, before </body> -->
${html}`,
        },
        {
            id: "astro",
            label: "Astro",
            file: "src/layouts/Layout.astro",
            hint: "Place is:inline on the script so Astro does not bundle it. Put it in the base layout used by every page.",
            code: `<!-- src/layouts/Layout.astro -->
<script is:inline id="counterscale-script" data-site-id="${siteId}" src="${src}" defer></script>`,
        },
    ];
}

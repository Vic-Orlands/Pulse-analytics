# Pulse Analytics

Pulse is a private, multi-site web analytics dashboard built on Cloudflare Workers and Analytics Engine. It is a customized fork of [Counterscale](https://github.com/benvinegar/counterscale).

It tracks page views, visitors, sessions, bounce rate, pages, referrers, campaigns, countries, regions, cities, browsers, operating systems, and device types without cookies or personal data.

## Stack

- SvelteKit 5, Tailwind CSS 4, Motion, Hugeicons, and LayerChart
- Cloudflare Workers and Analytics Engine
- R2 bucket provisioned for long-term rollups
- Anonymous browser and 30-minute session identifiers

## Development

Requires Node 20+ and pnpm 9+.

```bash
pnpm install
pnpm --filter @counterscale/tracker build
pnpm --filter @counterscale/server dev
```

The local dashboard is available at `http://localhost:5173`.

## Deployment

Enable Analytics Engine in the target Cloudflare account, create an API token with `Account Analytics: Read`, and authenticate Wrangler.

```bash
cd packages/server
pnpm wrangler login
pnpm wrangler secret put CF_BEARER_TOKEN
pnpm wrangler secret put DASHBOARD_PASSWORD
pnpm run deploy
```

The deployed Worker serves both the dashboard and tracker. Add this to each site:

```html
<script
    id="counterscale-script"
    data-site-id="your-site-id"
    src="https://your-worker.workers.dev/tracker.js"
    defer
></script>
```

Use a stable, unique `data-site-id` per application. Pulse itself uses `pulse`; the current connected applications use `portfolio` and `sleeksign`.

## Privacy

Pulse does not collect names, email addresses, form contents, IP addresses, or persistent cross-site identifiers. Anonymous visitor identifiers stay within each site's browser storage.

## License

MIT. See [LICENSE](LICENSE).

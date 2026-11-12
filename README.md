# Rude Utilities

Moving home? Sort energy, broadband, council tax and water online. No calls.

Originally built in Lovable, now hosted on Cloudflare Pages.

## Stack

- TanStack Start (React 19, SSR + server functions)
- Tailwind CSS 4, shadcn/ui
- Supabase (auth + database)
- Built with Vite + Nitro using the `cloudflare-pages` preset (see `vite.config.ts`)

## Local development

```sh
bun install
bun run dev
```

## Build and preview on the Cloudflare runtime

```sh
bun run build
bunx wrangler pages dev dist
```

The build writes static assets to `dist/` and the SSR worker to `dist/_worker.js/`.

## Deployment (Cloudflare Pages)

The Pages project `rude-utilities` builds from this repo:

- Build command: `bun run build`
- Output directory: `dist`
- Compatibility flag: `nodejs_compat` (set in `wrangler.toml`)

### Secrets

Set these in Cloudflare: Workers & Pages → rude-utilities → Settings → Variables and Secrets.

| Name | Used for |
| --- | --- |
| `ENERGY_SHOP_API_KEY` | Energy quotes and switching (`src/lib/energy-shop.functions.ts`) |
| `ENERGY_SHOP_AGENT_ID` | Submitting energy switches |
| `IDEAL_POSTCODES_API_KEY` | Address lookup (`src/lib/postcodes.functions.ts`) |

The public Supabase URL and publishable key live in `.env` and are baked in at build time.

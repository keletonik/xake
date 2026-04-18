# Vercel deployment

## Topology

A single Vercel project. The Next.js app in `apps/web` builds; the Hono API is mounted at `apps/web/app/api/[[...path]]/route.ts` and runs as Vercel Functions. Cron jobs in `vercel.json` invoke `/api/v1/cron/*` endpoints on schedule.

```
browser  ──HTTPS──▶  Vercel Edge  ──▶  Next.js (apps/web)
                                        ├─ pages (UI)
                                        └─ /api/* → Hono app (Vercel Function)
                                                    ├─ SSE quote stream (request-scoped)
                                                    ├─ assistant stream (Claude SSE)
                                                    ├─ watchlists / alerts / portfolio / orders
                                                    └─ /api/v1/cron/* (invoked by Vercel Cron)
```

## Setup

1. Fork or push the repo. Create a Vercel project pointing at the repo root.
2. Vercel auto-detects `vercel.json`. Leave the defaults.
3. Set env variables in the Vercel dashboard:

   | Key | Required | Purpose |
   |---|---|---|
   | `DEPLOY_TARGET` | yes | Set to `vercel` |
   | `APP_URL` | yes | Your production URL, e.g. `https://xake.app` |
   | `ALLOWED_ORIGINS` | no | Comma-separated; defaults to APP_URL |
   | `CRON_SECRET` | recommended | Shared secret; Vercel sends it as `Authorization: Bearer …` |
   | `ANTHROPIC_API_KEY` | no | Enables real Claude; without it, assistant runs in mock mode |
   | `CLAUDE_DEFAULT_MODEL` | no | Default `claude-sonnet-4-6` |
   | `CLAUDE_FAST_MODEL` | no | Default `claude-haiku-4-5-20251001` |
   | `CLERK_SECRET_KEY` | no | Enables auth |
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | no | Enables auth in the client |
   | `DATABASE_URL` | recommended | Postgres for persistence; Neon / Supabase / Vercel Postgres all fine |
   | `DATABASE_POOL_MAX` | no | Default 1 on serverless |
   | `ENABLE_COINBASE_FEED` | no | **Leave false on Vercel** — see caveats |

4. Deploy. The embedded API is live at `/api/v1/*`. Cron runs per `vercel.json`.

## Vercel-specific behaviour

- **Functions** run serverless. Each request gets a fresh process. The in-memory store resets between deploys. You need `DATABASE_URL` for durable state across invocations.
- **Cron** on Hobby runs once per day. Pro supports finer schedules (e.g. every 5 minutes) which the bundled `vercel.json` assumes. Downgrade the cron schedules if you're on Hobby.
- **Streaming** works. SSE responses stream fine inside the Function duration limit (60s by default per `vercel.json`). The browser reconnects via `EventSource` if a stream ends.
- **Upstream WebSocket** is not supported on Vercel Functions in any durable way. The platform adapter returns `capabilities.upstreamWs = false` for this target. Coinbase live-feed is disabled; the API falls through to the mock provider.
- **Queues / BullMQ** — no long-running worker. Use `DATABASE_URL` + the cron endpoint pattern, or the Vercel Queues beta. Document any off-platform worker explicitly.

## Migrations

Run migrations from your local machine against the production Postgres, or wire a one-shot job:

```bash
DATABASE_URL=postgres://… pnpm --filter @xake/db migrate
```

## Caveats you should not paper over

- If you need continuous upstream provider WS (Coinbase, Binance, or a licensed data feed), Vercel alone is not sufficient. Pair Vercel (for web + API) with a Reserved host (Replit, Fly, Railway) that runs `apps/api` standalone with `ENABLE_COINBASE_FEED=true`. Configure the web app to front the external API via `NEXT_PUBLIC_API_URL`.
- Vercel free tier's cron frequency is a hard product constraint. Alerts on Hobby can only evaluate once/day. This is not a fit for any user who actually needs alerts.
- Per-function memory/time limits apply to every AI streaming response. Heavy reasoning tasks should use the `/app/assistant` full-page experience and complete within the 60s window, or switch to the premium reasoning path behind an explicit flag.

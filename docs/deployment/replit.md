# Replit deployment

## Topology

Two services on Replit, both Reserved VM:

- `apps/web` — Next.js on port 3000 (public, via Autoscale or Reserved VM)
- `apps/api` — Standalone Hono server on port 4000 (Reserved VM — must stay running for upstream WS)
- `apps/worker` — In-process cron + alert evaluator (co-hosted with api or its own Reserved VM)

The web app fronts the API via `NEXT_PUBLIC_API_URL=http://localhost:4000`. Replit publishes one external port per service — route public traffic through web, keep api + worker internal.

## Setup

1. Import the repo into Replit.
2. Open **Secrets** and set:
   - `DEPLOY_TARGET=replit`
   - `XAKE_ENV=paper`
   - `APP_URL=https://<your-replit-url>`
   - `NEXT_PUBLIC_API_URL=http://localhost:4000`
   - `ANTHROPIC_API_KEY=sk-ant-…` (optional)
   - `CLERK_SECRET_KEY` + `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (optional)
   - `DATABASE_URL=postgres://…` (optional; use Replit Postgres or Neon)
   - `ENABLE_COINBASE_FEED=true` (safe here)
   - `CRON_SECRET=…`
3. Run the three processes. Replit's `.replit` file ships hints; adapt to your preferred start command.

## Why Replit is a better fit for realtime

Reserved VMs are long-running. That matters for:

- Upstream WebSocket to Coinbase / Binance / any provider WS
- In-process alert evaluation with sub-second latency
- Conversation-state caches that survive between requests
- SSE streams that hold open longer than a typical serverless function's timeout

## Running the migration

```bash
DATABASE_URL=$DATABASE_URL pnpm --filter @xake/db migrate
```

## Running all three locally under Replit

Replit workflow tabs (one tab per process):

```bash
# Tab 1 — API
pnpm dev:api

# Tab 2 — Worker
pnpm dev:worker

# Tab 3 — Web
pnpm --filter @xake/web dev
```

## Caveats

- Autoscale scales to zero when idle. For the API and worker, use Reserved VM — otherwise your upstream WS will disconnect every time the VM sleeps.
- Replit's single public external port means the API must be fronted through the web origin (via the rewrite) unless you use a separate Repl.
- Secrets live in Replit Secrets, not in committed files.

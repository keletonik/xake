# Local development

## Prereqs

- Node 20+
- pnpm 9+
- Optional: Postgres 14+ (only if you want persistence; otherwise in-memory store is used)
- Optional: Anthropic API key (otherwise assistant runs against a mock streamer)

## Install

```bash
pnpm install
```

## Run

Two viable layouts:

### A. Embedded API (simplest; matches Vercel)

```bash
pnpm --filter @xake/web dev     # :3000 — web + API + SSE mounted at /api/*
```

All routes (UI + API + SSE) run inside one Next.js process. The Hono app is mounted at `apps/web/app/api/[[...path]]/route.ts` via `hono/vercel`.

### B. Split topology (matches Replit; best for upstream WS)

```bash
pnpm dev:api            # :4000 — standalone Hono + stream manager
pnpm dev:worker         # in-process cron + alert evaluator
NEXT_PUBLIC_API_URL=http://localhost:4000 pnpm --filter @xake/web dev
```

The web app proxies `/api/*` to the Hono server at `NEXT_PUBLIC_API_URL` via `next.config.mjs` rewrites. Use this if you want Coinbase upstream WS running continuously, or to isolate long-lived connections from Next.js.

## Tests

```bash
pnpm test                          # Vitest — unit + integration
pnpm exec playwright install       # once
pnpm exec playwright test          # E2E smoke (expects dev server on :3000)
```

## Env file

Copy `.env.example` to `.env.local` (or `apps/web/.env.local`). For local dev, nothing is strictly required — defaults work.

## Enabling each capability

| You want | Set |
|---|---|
| Real crypto quotes | `ENABLE_COINBASE_FEED=true` (split topology recommended) |
| Real Claude traffic | `ANTHROPIC_API_KEY=sk-ant-…` |
| Auth | `CLERK_SECRET_KEY=…` + `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=…` |
| Postgres persistence | `DATABASE_URL=postgres://…` then `pnpm --filter @xake/db migrate` |

# XAKE

A premium, dark-theme trading decision cockpit. Chart-first, disciplined, and built for operators who want signal without the noise.

XAKE starts life as an analysis and paper-trading platform. Live execution is deliberately out of scope until licensed partners, data entitlements, and regulatory posture are in place. That separation is a feature, not a limitation — it lets us ship a serious product without pretending to be a broker.

## What's in the box

- Modular, customisable workspace with dockable panels
- Chart workspace with indicators, drawings, and order overlays
- Watchlists, screeners, alerts, and a news lane
- High-fidelity paper trading with fake funds and a consistent fill model
- AI assistant (Claude) for analysis, summaries, screening, and draft orders — never autonomous execution
- Theme system with dark, darker, and light/system modes
- Paper environment is always visually unmistakable

## Hard constraints

- No live real-money execution in this repo
- No fabricated brokerage or regulated functionality
- No unlicensed live market data — production feeds must be sourced through licensed vendors
- No generic fintech styling — design language is premium, terminal-grade, and intentional
- AI never places trades on its own. It can analyse, explain, screen, and draft. Humans confirm.

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js App Router + TypeScript |
| UI system | shadcn/ui + Radix + custom tokens |
| Charts | TradingView Lightweight Charts (V1), upgradeable later |
| Tables | AG Grid for dense/virtualised grids |
| API | TypeScript service with Hono or Express (Stage 1 decides) |
| Worker | BullMQ on Redis |
| DB | PostgreSQL with Timescale-style hypertables for time-series |
| Cache/queue | Redis |
| Auth | Clerk |
| Observability | OpenTelemetry + Sentry |
| Deploy | Replit (Reserved VM for streams/workers, Autoscale for stateless) |

## Local run

```bash
# Requires Node 20+ and pnpm 9+
pnpm install

# Run all three services in parallel terminals:
pnpm dev:api       # Hono API on :4000 (provides SSE and assistant streaming)
pnpm dev:worker    # alert evaluator loop (heartbeats)
pnpm dev           # Next.js on :3000 (web UI)

# Run tests
pnpm test

# Optional: enable live crypto quotes
ENABLE_COINBASE_FEED=true pnpm dev:api

# Optional: enable real Claude traffic
ANTHROPIC_API_KEY=sk-ant-... pnpm dev:api
```

Visit:
- `http://localhost:3000/` — landing
- `http://localhost:3000/app` — workspace dashboard
- `http://localhost:3000/app/markets` — market explorer
- `http://localhost:3000/app/charts?symbol=BTC-USD` — chart workspace
- `http://localhost:3000/app/watchlists` — lists
- `http://localhost:3000/app/alerts` — alerts
- `http://localhost:3000/app/portfolio` — paper portfolio
- `http://localhost:3000/app/paper` — order ticket
- `http://localhost:3000/app/assistant` — AI assistant
- `http://localhost:3000/style-guide` — tokens reference
- `http://localhost:3000/components` — primitive showcase

## Repository layout

```
xake/
  apps/
    web/           Next.js frontend
    api/           HTTP API, auth, orchestration
    worker/        Alerts, jobs, backfills, notifications
  packages/
    ui/            Design system, tokens, primitives
    charts/        Chart wrappers, overlays, studies
    data-core/     Provider abstraction and normalisers
    trading-core/  Order models, paper engine, risk rules
    ai-core/       Claude prompts, tools, schemas, guardrails
    analytics/     Telemetry and audit helpers
    config/        Env schema, feature flags, shared constants
  infra/
    db/            Migrations, seeds, RLS policies
    observability/ OTel, Sentry, dashboards
    deployment/    Replit config and env docs
  docs/
    product/       Product notes
    ux/            UX specs, wireframes, flows
    engineering/   Architecture, ADRs, runbooks
    runbooks/      Incident response, on-call
```

## Roadmap

Progress is tracked stage-by-stage in [`STAGES.md`](./STAGES.md). The short version:

- Stage 0 — Scaffold (done)
- Stage 1 — Tooling, shared config, env schema, CI skeleton
- Stage 2 — Design tokens and workspace shell
- Stage 3 — Auth and app chrome
- Stage 4 — Data core and mock feed
- Stage 5 — Charts and watchlists
- Stage 6 — Paper trading engine
- Stage 7 — Alerts worker
- Stage 8 — AI assistant service
- Stage 9 — Landing page, onboarding, settings polish
- Stage 10 — Hardening, observability, audit ledger, deployment

## Architecture

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the service map, data flow, and environment boundaries.

# XAKE build stages

Each stage is self-contained. It ships, it's verified, it's committed, and then the next stage begins. No stage depends on unfinished work in a later stage. If something breaks, it gets isolated and fixed inside its own stage — forward progress is never blocked by a single failing module.

Legend: `[x]` done · `[~]` in progress · `[ ]` not started

---

## Stage 0 — Scaffold

Goal: directory tree, workspace wiring, placeholder services, minimal Next.js shell that boots.

- [x] Monorepo root with pnpm workspaces
- [x] `apps/web`, `apps/api`, `apps/worker` scaffolded
- [x] `packages/*` scaffolded with package.json stubs
- [x] `infra/*` folders with placeholder READMEs
- [x] `docs/*` folders with placeholder READMEs
- [x] Root README, STAGES, ARCHITECTURE, .env.example, .gitignore, .nvmrc, tsconfig.base
- [x] Minimal Next.js App Router shell that renders a "Stage 0" confirmation

Exit criteria: `pnpm install && pnpm dev` boots the web shell without errors.

---

## Stage 1 — Tooling and shared config

Goal: lint, format, typecheck, env validation, CI skeleton, shared tsconfig, basic test runner.

- [ ] ESLint + Prettier config shared across workspaces
- [ ] `packages/config` with Zod env schema and feature flags
- [ ] Root `tsconfig.base.json` extended correctly by each workspace
- [ ] Vitest wired for unit tests
- [ ] Minimal GitHub Actions (or Replit equivalent) for lint/typecheck/test
- [ ] Husky + lint-staged pre-commit (optional, behind a flag)

Exit criteria: `pnpm lint && pnpm typecheck && pnpm test` all pass on a clean clone.

---

## Stage 2 — Design tokens and workspace shell

Goal: the XAKE look and feel — tokens, typography, surfaces, theme toggle.

- [x] `packages/ui` with colour, spacing, radius, shadow, type, motion, z-index tokens
- [x] Geist Sans + Geist Mono wired via `geist/font` with a safe fallback stack
- [x] Dark, darker, and light/system theme modes wired via CSS variables
- [x] Theme provider, theme toggle, flash-free bootstrap script
- [x] Primitives: Button, Input, Textarea, Badge, EnvBadge, Kbd, Separator, Card, Panel, Toolbar, SectionHeader, StatusBar, EmptyState, ErrorState, AppShell
- [x] Radix-backed: Tabs, Tooltip, Dialog, Toast
- [x] Paper-environment badge as a dedicated primitive
- [x] Live `/style-guide` page covering palette, type, spacing, radii, shadows, motion, semantics
- [x] Live `/components` page showcasing every primitive interactively
- [x] Token and primitive documentation in `docs/ux/`
- [x] `prefers-reduced-motion` honoured at the root

Exit criteria: workspace shell renders with theme toggle and paper badge; all primitives pass keyboard and contrast checks.

---

## Stage 3 — App chrome and workspace shell

Goal: the real workspace lives at `/app/*` with top bar, left rail, main canvas, docked assistant, and status footer.

- [x] `/app` layout with `AppShell` composition
- [x] Rail navigation across Dashboard, Markets, Charts, Watchlists, Alerts, Portfolio, Paper, Assistant
- [x] Docked assistant side panel on every `/app/*` route
- [x] Status rail polling `/v1/health` for feed + AI + env state
- [x] Deferred: Clerk sign-in (enabled in Stage 3.5 once live trading is not a blocker)

Exit criteria: every `/app/*` page renders in the unified shell with persistent env badge and assistant.

---

## Stage 4 — Data core and mock feed

- [x] `packages/data-core` with `MarketDataProvider`, `NewsProvider`, `MacroCalendarProvider`, `PortfolioSource`, `ExecutionVenue` interfaces
- [x] Canonical types: `Quote`, `Trade`, `Candle`, `OrderBookLevel/Snapshot`, `NewsItem`, `MacroEvent`, `ProviderHealth`
- [x] `MockMarketDataProvider` with seeded catalogue and deterministic ticks
- [x] `CoinbaseMarketDataProvider` (behind `ENABLE_COINBASE_FEED`) for crypto realtime via public WS
- [x] SSE quote gateway `GET /v1/stream/quotes` fanning out normalised ticks
- [x] Every quote stamped with `source`, `feedClass`, `ageMs`, `receivedAt`

---

## Stage 5 — Charts and watchlists

- [x] `packages/charts` wrapper around TradingView Lightweight Charts
- [x] Candle, line, area series with XAKE tokens
- [x] Crosshair, timeframe switcher, instrument switcher, chart-type selector
- [x] Watchlist CRUD with pinning, tags, notes
- [x] Market explorer with instrument preview drawer, filters by asset class, add-to-watchlist
- [x] Failure handling: no data, provider unavailable, stale feed, invalid symbol

---

## Stage 6 — Alerts, portfolio, paper trading, AI co-pilot

- [x] `packages/trading-core` order model (side, type, TIF, status, reason)
- [x] Paper engine: validation, slippage, limit matching on live ticks, buying-power enforcement, short-selling blocked
- [x] Portfolio reducer with weighted-average cost, realised/unrealised P&L, equity calc
- [x] Paper reset flow with audit event
- [x] Alert engine: price, percentage move, watchlist conditions; dedupe via SHA-1 condition hash; cooldowns; firing events and history
- [x] AI assistant: Claude Sonnet 4.6 default with Haiku fallback; SSE streaming; six tools; Zod-validated structured outputs; draft-confirm gating
- [x] Docked assistant available on every workspace page
- [x] Postgres schema in `infra/db/migrations/0001_init.sql` — mirrors the in-memory store exactly

---

## Stage 7 — Alerts worker

Goal: price, indicator, portfolio, and news alerts with dedupe and delivery.

- [ ] BullMQ queues in `apps/worker` for evaluation and delivery
- [ ] Alert definitions (Zod-validated) stored in Postgres
- [ ] Evaluator loop consumes canonical ticks and fires alerts with cooldowns
- [ ] Dedupe via condition-hash + cooldown window
- [ ] Delivery channels: in-app toast, email stub, webhook stub
- [ ] Alert history view with filter and acknowledge

Exit criteria: a price alert fires once per cooldown, renders in-app, and appears in history with provenance.

---

## Stage 8 — AI assistant service

Goal: Claude-powered assistant as a guardrailed co-pilot.

- [ ] `packages/ai-core` with prompt templates, tool schemas, guardrails
- [ ] Claude service in `apps/api` with SSE streaming to browser
- [ ] Default model Sonnet 4.6; Haiku 4.5 for lightweight tasks; Opus 4.7 gated
- [ ] Prompt caching for system instructions, tool schemas, workspace context
- [ ] Tools: `search_instruments`, `summarise_news`, `build_watchlist`, `draft_order`, `explain_chart`
- [ ] Every tool action is logged; draft orders require explicit user confirmation
- [ ] Graceful 429 handling with `retry-after` and model downgrade ladder
- [ ] Structured output schemas for alerts, watchlists, and order drafts

Exit criteria: assistant streams a response, proposes a watchlist, drafts an order, and cannot submit it without a confirmed user action.

---

## Stage 9 — Landing, onboarding, settings

Goal: the public face and first-run experience.

- [ ] Marketing landing page with hero, proof strip, feature bands, CTA
- [ ] Onboarding flow: timezone, default risk, theme choice, starter watchlists
- [ ] Settings surfaces: security, data entitlements, appearance, notifications, sessions
- [ ] Mobile monitoring view for dashboard and watchlists
- [ ] Accessibility pass (keyboard, focus, contrast, reduced-motion)

Exit criteria: new user reaches their first chart in under 60 seconds from landing.

---

## Stage 10 — Hardening, observability, deployment

Goal: ship-ready posture.

- [ ] OpenTelemetry traces across web, api, worker
- [ ] Sentry for errors and performance
- [ ] Immutable audit ledger for auth, entitlements, orders, AI actions
- [ ] Postgres row-level security for workspace isolation
- [ ] Secrets rotation runbook
- [ ] Replit deployment config: Autoscale for stateless, Reserved VM for streams/workers
- [ ] Incident runbooks for stream loss, stale feed, failed auth, rate limits
- [ ] Load and chaos tests for reconnect, dedupe, and AI 429 handling

Exit criteria: a clean deploy boots, traces are visible end-to-end, audit events are queryable, and reconnect/chaos tests pass.

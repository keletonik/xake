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

- [ ] `packages/ui` with colour, spacing, radius, shadow, and type tokens
- [ ] Geist Sans + Geist Mono with a safe fallback stack
- [ ] Dark, darker, and light/system theme modes wired via CSS variables
- [ ] Theme toggle component with `prefers-reduced-motion` support
- [ ] Core primitives: Button, Input, Panel, Tabs, Tooltip, Toast, Dialog (Radix-based)
- [ ] App shell: top bar, left rail, right drawer, status footer
- [ ] Paper-environment badge that is impossible to miss

Exit criteria: workspace shell renders with theme toggle and paper badge; all primitives pass keyboard and contrast checks.

---

## Stage 3 — Auth and app chrome

Goal: Clerk-based auth, session handling, protected routes, workspace provisioning.

- [ ] Clerk wired in `apps/web` with branded sign-in/up
- [ ] Server-side session validation on every privileged route
- [ ] Workspace model in Postgres (user → workspace → panels)
- [ ] RBAC roles seeded: user, support, ops, compliance, admin
- [ ] Empty dashboard renders for a signed-in user

Exit criteria: sign up, sign in, sign out, land on a personal empty dashboard, log audit events for each.

---

## Stage 4 — Data core and mock feed

Goal: provider abstraction, normalised market data model, mock feed for deterministic dev.

- [ ] `packages/data-core` with `MarketDataProvider`, `ExecutionVenue`, `PortfolioSource` interfaces
- [ ] Canonical types: `Quote`, `Trade`, `Candle`, `OrderBookLevel`, `NewsItem`
- [ ] In-memory mock provider with seeded instruments and deterministic ticks
- [ ] WebSocket gateway in `apps/api` that fans out mock ticks to browser via SSE or WS
- [ ] Every quote stamped with `source`, `feedClass`, `ageMs`

Exit criteria: web shell subscribes to a mock instrument and renders a live ticker driven by the gateway.

---

## Stage 5 — Charts and watchlists

Goal: the chart workspace and watchlist module.

- [ ] `packages/charts` wrapper around Lightweight Charts
- [ ] Candle, line, and area series with XAKE styling
- [ ] Crosshair, timeframe switcher, instrument switcher
- [ ] Watchlist grid (AG Grid) with sparklines and alert badges
- [ ] Add-to-watchlist, reorder, tag, note
- [ ] Keyboard navigation for watchlists (WAI-ARIA grid pattern)

Exit criteria: user can pick an instrument from a watchlist, see it on the chart, switch timeframes, and navigate with the keyboard.

---

## Stage 6 — Paper trading engine

Goal: deterministic, obvious, trustworthy paper trading.

- [ ] `packages/trading-core` order model: side, type, TIF, brackets
- [ ] Paper engine with configurable fill model (mid, touch, with slippage)
- [ ] Paper ledger in Postgres: orders, fills, positions, balances, P&L
- [ ] Reset flow with confirmation and audit event
- [ ] Order ticket UI with pre-submit validation and consequence preview
- [ ] Environment separation: paper vs (future) live is a first-class type

Exit criteria: user places, modifies, and cancels paper orders; P&L and positions reconcile from the event ledger.

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

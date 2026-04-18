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

## Stage 7+ — Public site, auth, settings, deployment parity, polish, platform adapters

- [x] Premium marketing site: landing overhaul, `/features`, `/security`, `/pricing`, `/changelog`
- [x] Polish primitives in `@xake/ui`: Skeleton, PaperBanner, CommandPalette (⌘K)
- [x] Clerk auth in `apps/web/middleware.ts` with graceful demo-account fallback
- [x] Sign-in / sign-up pages (Clerk when configured, explainer fallback otherwise)
- [x] Settings page with tabs: appearance, workspace defaults, paper, AI, notifications, security
- [x] `/v1/preferences` API (GET + PATCH) with per-account persistence
- [x] `@xake/platform` package: `resolveTarget`, `describeCapabilities`, `MemoryQueue`, `InProcessCronAdapter`, `VercelCronAdapter`, `ConsoleObservability`
- [x] `@xake/db` package: `postgres` connection factory, migration runner, repository interface, `PostgresPreferencesRepository` template
- [x] Migration `0002_preferences.sql`
- [x] `apps/api` split: `app.ts` (pure Hono) + `server.ts` (standalone)
- [x] Hono app mounted at `apps/web/app/api/[[...path]]/route.ts` via `hono/vercel`
- [x] `currentAccountId(c)` — reads `x-xake-user-id` header (set by middleware from Clerk) or falls back to demo
- [x] `/v1/cron/evaluate-alerts` and `/v1/cron/health-sweep` endpoints, `CRON_SECRET` gated
- [x] Stream manager auto-starts on first subscribe (Vercel-friendly)
- [x] Status rail detects stale feed / API unreachable / provider down
- [x] Integration tests hitting Hono via `app.request()` (health, watchlists, alerts, orders, preferences, cron)
- [x] Playwright config + smoke E2E scaffold (`e2e/smoke.spec.ts`)
- [x] `vercel.json` with function timeouts and cron schedules
- [x] `.replit` documenting split topology
- [x] Docs: `deployment/local`, `deployment/vercel`, `deployment/replit`, `deployment/adapters`
- [x] `release-audit.md` (brutal) and `roadmap.md` (V1/V1.5/V2 gates)

---

## Future stages (post-V1)

See [`docs/engineering/roadmap.md`](./docs/engineering/roadmap.md) for V1.5 and V2 gates. The biggest outstanding items:

- Full Postgres persistence across every entity (interface is ready; only preferences is wired)
- Durable queues (Redis/BullMQ or Vercel Queues beta)
- OTel + Sentry integrations behind `@xake/platform`'s `ObservabilityAdapter`
- Licensed real-time data for at least one asset class
- Prompt caching on Anthropic calls once conversation persistence lands
- Clerk enforcement in production (build-time assertion)
- Playwright E2E in CI
- Row-level security policies on Postgres

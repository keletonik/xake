# XAKE roadmap

Three horizons. Each item has a clear gate — the condition that must be true before it ships.

## V1 — "analysis + paper" preview

Shippable today as a preview product.

- [x] Design system, app shell, seven workspace pages, docked assistant
- [x] Paper trading engine (validated, unit-tested, event-sourced)
- [x] Mock provider + Coinbase public WS (feature-flagged)
- [x] Claude assistant with draft-confirm gating
- [x] Marketing site
- [x] Deployment parity: Vercel + Replit
- [x] Clerk auth with graceful demo fallback
- [x] Settings page with per-user preferences
- [ ] **Gate: move persistence from in-memory to Postgres before any multi-user deployment.** Single-vertical example (`PostgresPreferencesRepository`) ships; the rest needs porting.
- [ ] **Gate: enforce Clerk in production.** Add a build-time assertion that `CLERK_SECRET_KEY` is set whenever `APP_URL` points outside `localhost`.
- [ ] **Gate: run Playwright smoke in CI.** The spec is scaffolded; a workflow file is missing.
- [ ] **Gate: prominent risk disclosure on every page.** Paper banner is there; add an expanded disclosure in the footer and settings.

## V1.5 — "serious daily-use"

- Full Postgres persistence across watchlists, alerts, orders, fills, positions, audit
- Row-level security policies enforced per `account_id`
- Assistant conversation persistence with prompt-cache markers on system prompt + tool schemas
- Tool result round-trip: user-confirmed actions feed back into the assistant context
- Licensed real-time data for at least one asset class (equities or FX)
- News and macro providers wired with rate-limited vendors
- Email delivery for alerts via a real transactional-email provider
- Webhook delivery for alerts
- Equity curve chart on portfolio page
- Chart indicators: EMA, VWAP, RSI; drawing tools
- Partial fills in the paper engine
- Playwright E2E in CI, plus a provider-integration contract test for each real provider
- OTel + Sentry on both targets
- Vercel Queues beta OR Redis/BullMQ worker on Replit
- Audit ledger migrated to Postgres with append-only enforcement
- Rate limiting on API routes
- Billing integration (Stripe) for the Pro tier — indicative pricing only

Gates for V1.5:

1. At least one licensed data-vendor contract signed and budgeted.
2. DB-backed multi-user isolation verified via integration tests.
3. Security review signed off (RLS, secrets, session handling, audit).
4. Load tests for SSE concurrency and alert evaluation.

## V2 — "live routing"

- Broker-connected order routing through licensed partners
- Jurisdiction-scoped onboarding and KYC/AML
- Per-account entitlement enforcement at the API boundary
- Order routing with venue filter validation, session calendars, real partial fills
- Real risk controls: position sizing rules, per-symbol exposure caps, max daily loss
- Audit ledger certified retention (7+ years in most jurisdictions)
- Regulatory reporting pipeline where required
- Step-up auth for mutating actions in live mode
- Assistant operates strictly in advisory mode in live; any order-like action requires an explicit, separate confirmation step with a summary and risk preview
- Public-facing status page with feed-health history
- SOC 2-adjacent controls: access reviews, change management, incident response runbooks

Gates for V2:

1. Broker-dealer / AFSL (or equivalent) status achieved, or a partner-of-record structure in place with legal sign-off in each jurisdiction.
2. All client-facing disclosures reviewed by counsel.
3. Capital requirements understood and provisioned.
4. Independent penetration test completed and remediation closed.
5. Go-live checklist covering every item in `docs/engineering/release-audit.md` Blocked and Risky columns.

**Until those gates are closed: V2 does not ship.** No exceptions.

## Nice-to-have (any horizon)

- Strategy marketplace (read-only templates first)
- Voice-mode assistant
- Advanced simulation scenarios (backtesting, stress tests)
- Collaborative workspaces
- Trade journal + coaching module
- Mobile-first monitor view (the web shell already collapses gracefully; dedicated app is its own scope)

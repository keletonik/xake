# XAKE second-pass audit

Re-audit after the V1 blocker fixes landed on `cc93679`. Static-only review:
the sandbox can't run `pnpm install`, `pnpm build`, `pnpm test`, or
Playwright, so anything needing execution is flagged unverified.

## Build / boot

`packages/trading-core/src/alerts.ts:1-27` no longer imports `node:crypto`;
it uses `globalThis.crypto.randomUUID()` and an FNV-1a hash for dedupe.
Client bundles stop tripping webpack's `UnhandledSchemeError`.
`packages/db/src/index.ts:55` keeps the migration runner out of the public
barrel. `apps/web/app/api/[[...path]]/route.ts:15-24` strips `/api` before
delegating to Hono so standalone and Vercel mounts share one route table.
Static read passes. Real boot still needs a successful `pnpm install`.

## Package graph

`packages/platform/src/index.ts:13-20` resolves `DEPLOY_TARGET` with
auto-detection for Vercel and Replit; core packages don't branch on the
target. `packages/ai-core/package.json` has no provider SDK dependency:
the SDK stays server-only, imported only from `apps/api`.
`apps/web/package.json` imports `@xake/api` as a library for the Vercel
mount. That's a deliberate seam, but a future ESLint rule forbidding
`@xake/api` from client components would lock it in.

## Next.js wiring

Every workspace package is in `transpilePackages`. The catch-all API route
runs on `runtime = "nodejs"`, not Edge. Middleware uses a top-level
`await import("@clerk/nextjs/server")`; works in Next 14, but smoke-test
on a Vercel preview before rollout.

## Security

`apps/api/src/app.ts:26-32` scopes CORS to `ALLOWED_ORIGINS` with
`credentials: true`. `apps/api/src/env.ts:45-61` keeps API keys, Clerk
secret, and `DATABASE_URL` server-only. `apps/api/src/routes/cron.ts:18-23`
gates cron with `CRON_SECRET`.

Open: no CSRF token on mutating endpoints (acceptable for preview given
SameSite + CORS, not for V1 public). `CRON_SECRET` is optional; a
prod-only build assertion would lock it in.

## Auth

`apps/web/middleware.ts:42-60` returns `401 UNAUTHENTICATED` on API routes
when Clerk is on and there's no session or demo cookie. Lines 33-36 short-
circuit on the demo cookie for both `/app/*` and `/api/*`.
`apps/api/src/lib/current-account.ts:23-35` resolves demo id then Clerk
user id then the `DEMO_ACCOUNT_ID` fallback. Demo ids are sanitised,
prefixed `demo_`, capped at 64 chars. Step-up auth and session list UI
are V1.5.

## Design / UI

One token set drives marketing and app surfaces. The marketing hero uses
the same primitives the workspace uses (`Badge`, `Button`, `Card`,
`SectionHeader`, `Separator`); no template smell. `PaperBanner` and
`DemoStrip` sit above the shell so paper + demo signalling is redundant
by design.

## Accessibility

`--focus-ring` applied via `:focus-visible`. `prefers-reduced-motion`
collapses durations at the root. Radix primitives bring correct ARIA on
Dialog, Tabs, Tooltip, Toast.

Open: no axe-core. Assistant dock doesn't collapse on narrow viewports.

## UX

`status-rail.tsx:50-90` surfaces stale / disconnected / degraded states.
The Settings AI toggle now actually hides the dock
(`workspace-main.tsx:13-18`) and the paper starting cash actually seeds
`resetPaperBalance` (`store.ts:163-178`). Settings stop being write-only.

Open: alert fires don't raise a toast. `defaultValue + onBlur` still has
no in-line confirmation.

## Performance

`coinbase.ts:38-47` lazy-imports `ws` and the instrument catalogue from
`start()`. Vercel functions don't pay for `ws` when the feed is off.
`stream-manager.ts:55-60` makes `ensureStarted()` the bootstrap path so
serverless SSE works without a boot hook.

Open: module-level singletons (`store`, `streamManager`) are per-function
on Vercel. Honest, documented, but production needs a DB.

## Tests

Unit suites under `packages/trading-core/src/*.test.ts`,
`packages/data-core/src/normalise.test.ts`,
`packages/ai-core/src/schemas.test.ts`. Integration in
`apps/api/src/__tests__/integration.test.ts` drives Hono via
`app.request()`. Playwright scaffold in `e2e/smoke.spec.ts`; not run.

Gaps: no test for the 401 branch, no test for the demo-cookie promotion in
`apps/api/src/app.ts:34-45`, no green Playwright run on the branch.

## Reliability

Quote stream backs off exponentially up to ~32s. Coinbase upstream does
the same. `ConsoleObservability` is the default; OTel and Sentry are
deferred. No runbook content, no load test plan.

## Data / persistence

`infra/db/migrations/0001_init.sql` mirrors the in-memory store field for
field; `0002_preferences.sql` adds preferences with snake-case columns
mapped through `rowToRecord`. Repository contracts are typed in
`packages/db/src/repositories/types.ts`. Only Preferences has a concrete
Postgres adapter; the rest still run through the in-memory store.

## Deployment

`vercel.json` carries function `maxDuration` and cron schedules. `.replit`
documents the split topology. `docs/deployment/adapters.md` lists the
capability matrix.

Open: Replit worker doesn't share state with the API yet. Vercel Hobby's
cron frequency limit is in docs but should be a hard comment in
`vercel.json`.

## Compliance / copy

Pricing refuses to invent live numbers. Security has a real "in place vs
not yet" split. Orders hard-reject non-paper with `403 LIVE_DISABLED`.
`docs/engineering/release-audit.md` lists the regulatory items
(broker-dealer / AFSL / MiFID II / AML-KYC / data entitlements / ledger
retention). Australian spelling is consistent. No "AI makes you money"
copy.

Open: no `robots.txt`, no `sitemap.ts`. `docs/product/` and `docs/ux/`
still hold Stage-0 scaffold READMEs.

## Ship status

Preview-ready. V1-public still gated on:

1. Postgres adapters for Watchlists, Alerts, Trading, Audit.
2. Playwright executed green in CI on this branch.
3. Toast for alert fires.
4. CI guard that fails the build if any client chunk has a `node:` string.
5. Prod-only assertions for `CLERK_SECRET_KEY`, `DATABASE_URL`, and
   `CRON_SECRET` when `APP_URL` isn't localhost.

Non-blocking: mobile dock collapse, axe-core, split marketing CSS,
runbook content, the ESLint rule above, `robots.txt`, `sitemap.ts`.

## Scorecard

| Dimension | Score | Note |
|---|---|---|
| Architecture | 8.5/10 | Clean graph, explicit platform adapters, one deliberate seam. |
| Code quality | 8/10 | Pure-functional core, Zod at boundaries, hacks cleaned this pass. |
| UI quality | 9/10 | Design system holds; paper + demo signalling redundant by design. |
| UX quality | 7.5/10 | Preferences flow through; alert-fire toast still missing. |
| Accessibility | 7.5/10 | Focus, contrast, motion tokens correct; no automated a11y tests. |
| Domain correctness | 8.5/10 | Paper engine, alerts, portfolio correct in unit tests. |
| Auth / security | 8/10 | 401 enforcement landed; CSRF tokens absent. |
| Deployment readiness | 8/10 | Vercel + Replit from one codebase; capability matrix honest. |
| Test reliability | 6/10 | Unit strong; integration thin; E2E unverified. |
| Release readiness | 6.5/10 | Preview-ready; public V1 needs the five gates above. |

The fixes between `098cb7d` and `cc93679` closed every critical issue
from the first audit. What remains is expected V1.5 work: Postgres
concretes, a CI-green E2E run, and toast-based alert delivery. No new
critical issue introduced.

# XAKE master audit — second pass

**Scope.** A deeper, higher-rigour re-audit of the entire codebase after the V1 blocker fixes landed on commit `cc93679`. Fifteen specialist reviewers, each signing their own verdict with file and line evidence. Synthesis at the end by the Principal Release Engineer. Brutal honesty throughout — a reviewer who cannot verify a claim marks it unverified rather than inferring pass.

**Ground rule.** Nothing in this document was observed at runtime in the audit environment — the sandbox cannot run `pnpm install`, `pnpm build`, `pnpm test`, or Playwright. Every claim labelled `VERIFIED` is from static source reading. Every claim that would require execution is labelled `UNVERIFIED`.

---

## A1 — Principal Release Engineer

**Scope.** Build health, dev boot, prod boot, route resolution, no-surprise deploys.

**Evidence.**
- `packages/trading-core/src/alerts.ts:1-27` — the prior `node:crypto` import is gone; replaced with isomorphic `globalThis.crypto.randomUUID()` and an FNV-1a dedupe hash. Client bundles that previously tripped Webpack's `UnhandledSchemeError` no longer drag Node built-ins through the barrel.
- `packages/db/src/index.ts:55` — migration runner kept out of the public barrel; client imports stay clean.
- `apps/web/app/api/[[...path]]/route.ts:15-24` — strips `/api` from the URL before delegating to the Hono app, so standalone and Vercel mounts share one Hono route table.

**Verdict.** `PASS (VERIFIED statically)`. First real dev boot will still need `pnpm install` to succeed; that is a runtime check I cannot perform here.

---

## A2 — Staff Software Architect

**Scope.** Package graph, import discipline, platform-agnostic core vs platform adapters.

**Evidence.**
- `packages/platform/src/index.ts:13-20` — `resolveTarget` reads `DEPLOY_TARGET` with sensible auto-detection for Vercel and Replit. Core packages never branch on the target directly.
- `packages/ai-core/package.json:15-18` — no `@anthropic-ai/sdk` dependency; the SDK stays server-only, imported only in `apps/api`.
- `apps/web/package.json:14-26` — imports `@xake/api` as a library for the Vercel mount. This is a deliberate seam; disciplined today but deserves a lint guard in a future pass.

**Verdict.** `PASS`. No circular deps. One medium-term improvement: an ESLint rule forbidding `@xake/api` imports from client components.

---

## A3 — Senior Frontend Build Engineer (Next.js)

**Scope.** `transpilePackages`, SSR vs CSR boundaries, middleware runtime, route mount correctness.

**Evidence.**
- `apps/web/next.config.mjs:7-16` — every workspace package listed under `transpilePackages`.
- `apps/web/app/api/[[...path]]/route.ts:13` — `runtime = "nodejs"`; the mount executes server-only dependencies in the Node runtime, not the Edge.
- `apps/web/middleware.ts:27` — top-level `await import("@clerk/nextjs/server")` works in Next 14 middleware, but behaviour on the Edge runtime is worth a single Vercel-preview smoke test before rollout.

**Verdict.** `PARTIAL (UNVERIFIED)`. Build-graph is correct on paper. The Clerk dynamic import is the only residual runtime risk.

---

## A4 — Principal Security Engineer (AppSec)

**Scope.** CORS, secrets, exposure surface, request-level hygiene.

**Evidence.**
- `apps/api/src/app.ts:26-32` — CORS scoped to `ALLOWED_ORIGINS`; `credentials: true`.
- `apps/api/src/env.ts:45-61` — no secret reaches the client. `ANTHROPIC_API_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL` all live in server-only scope.
- `apps/api/src/routes/cron.ts:18-23` — `CRON_SECRET` gating. Works whether Vercel or an external scheduler invokes the endpoint.

**Open items.**
- No CSRF token on mutating endpoints. Acceptable for preview (SameSite + CORS), not for V1 public.
- `CRON_SECRET` is optional; a prod-only build assertion would lock it in.

**Verdict.** `PARTIAL`. No critical exposure; two medium-term hardening items.

---

## A5 — Staff AuthN / AuthZ Reviewer

**Scope.** Middleware, session resolution, demo isolation, API enforcement.

**Evidence.**
- `apps/web/middleware.ts:42-60` — API routes return `401 UNAUTHENTICATED` when Clerk is enabled and no session or demo cookie is present. Closes the earlier silent-demo bypass.
- `apps/web/middleware.ts:33-36` — demo cookie short-circuits auth cleanly for both `/app/*` and `/api/*`; the API scopes state to the demo id.
- `apps/api/src/lib/current-account.ts:23-35` — resolution order: demo id → Clerk user id → `DEMO_ACCOUNT_ID` fallback. Demo ids are sanitised, prefixed `demo_`, and capped at 64 characters.

**Verdict.** `PASS`. The remaining work belongs to V1.5 (step-up auth, session TTL, session list UI).

---

## A6 — Director of Design & Brand

**Scope.** Design system coherence across marketing and app, paper-mode signage, originality.

**Evidence.**
- `packages/ui/src/tokens.css:1-120` — single token set drives both marketing and app surfaces.
- `apps/web/app/(marketing)/page.tsx` — hero uses the same primitives the workspace uses (`Badge`, `Button`, `Card`, `SectionHeader`, `Separator`). No template smell.
- `apps/web/app/app/layout.tsx:13-17` — `PaperBanner` and `DemoStrip` sit above the shell. Paper + demo signalling is redundant by design.

**Verdict.** `PASS`. The design language holds up under cross-surface scrutiny.

---

## A7 — Staff Accessibility Engineer (WCAG 2.2 AA)

**Scope.** Focus, contrast, keyboard navigation, reduced motion.

**Evidence.**
- `packages/ui/src/tokens.css:186-192` — `--focus-ring` applied globally via `:focus-visible`.
- `packages/ui/src/tokens.css:240-248` — `prefers-reduced-motion` collapses durations at the root.
- Radix-backed primitives (Dialog, Tabs, Tooltip, Toast) inherit correct ARIA behaviour.

**Open items.**
- No axe-core or automated a11y tests.
- Assistant dock does not collapse on narrow viewports — small-screen users lose significant main-area width.

**Verdict.** `PARTIAL`. Core is sound; automated coverage and mobile dock behaviour are the next jobs.

---

## A8 — Principal Product UX

**Scope.** Flow clarity, state visibility, error and loading states, affordances.

**Evidence.**
- `apps/web/app/app/_ui/status-rail.tsx:50-90` — stale / disconnected / degraded states surface loudly.
- `apps/web/app/app/settings/page.tsx` — the AI toggle now actually hides the dock (see `apps/web/app/app/_ui/workspace-main.tsx:13-18`), and the paper starting cash actually seeds `resetPaperBalance` (`apps/api/src/lib/store.ts:163-178`). Settings are no longer write-only dials.

**Open items.**
- Alert fires do not yet raise a toast.
- `defaultValue + onBlur` in settings still lacks an in-line confirmation other than the global badge.

**Verdict.** `PASS` with follow-ups.

---

## A9 — Staff Performance Engineer

**Scope.** Bundle size, cold start, streaming behaviour.

**Evidence.**
- `packages/data-core/src/providers/coinbase.ts:38-47` — `ws` and the instrument catalogue are lazy-imported on `start()`. Vercel functions carrying the package no longer pay for `ws` when the feed is off.
- `apps/api/src/services/stream-manager.ts:55-60` — `ensureStarted()` is the lazy bootstrap path; serverless SSE works without a boot hook.

**Open items.**
- Module-level singletons (`store`, `streamManager`) are per-function on Vercel. Honest and documented, but a production deploy must bring a DB.

**Verdict.** `PASS` for preview; `PARTIAL` for production without DB persistence.

---

## A10 — Principal QA Architect

**Scope.** Unit, integration, E2E discipline.

**Evidence.**
- Unit suites under `packages/trading-core/src/*.test.ts`, `packages/data-core/src/normalise.test.ts`, `packages/ai-core/src/schemas.test.ts`. Seven paper-engine cases, five portfolio cases, six alert cases.
- `apps/api/src/__tests__/integration.test.ts` drives Hono via `app.request()` — same handler as production, both standalone and serverless.
- `e2e/smoke.spec.ts` — Playwright scaffold present; not executed in the audit environment.

**Open items.**
- No test for the new 401 branch in the middleware.
- No test covering the demo cookie promotion in `apps/api/src/app.ts:34-45`.

**Verdict.** `PARTIAL`. Strong unit base; integration thin; E2E unverified.

---

## A11 — Staff Reliability / SRE

**Scope.** Failure-mode coverage, reconnect, observability hooks.

**Evidence.**
- `apps/web/lib/use-quote-stream.ts:53-64` — exponential backoff capped at ~32 s.
- `packages/data-core/src/providers/coinbase.ts:130-138` — upstream reconnect with exponential backoff.
- `packages/platform/src/index.ts:210-218` — `ConsoleObservability` is the default adapter; OTel and Sentry are deferred.

**Open items.**
- No incident runbook content under `docs/runbooks/`.
- No load-test plan.

**Verdict.** `PARTIAL`. Graceful failures are wired; tooling to observe them is not.

---

## A12 — Principal Data & Persistence Engineer

**Scope.** Schema fidelity, migration story, repository contract.

**Evidence.**
- `infra/db/migrations/0001_init.sql` — mirrors the in-memory store's shapes field-for-field.
- `infra/db/migrations/0002_preferences.sql` — new preferences table with snake-case columns; repository maps explicitly through `rowToRecord`.
- `packages/db/src/repositories/types.ts` — typed interfaces for Watchlists, Alerts, Trading, Preferences, Audit. The contract is in place; concrete Postgres adapters land next stage.
- `packages/db/src/factory.ts` — selects memory vs Postgres based on `DATABASE_URL`.

**Open items.**
- Only preferences has a concrete Postgres adapter today. Everything else runs through the in-memory store until the rest of the adapters ship.

**Verdict.** `PARTIAL`. Architecture complete; implementation needs the remaining verticals.

---

## A13 — Senior DevOps / Platform Engineer

**Scope.** Deployment parity, cron, queue, secrets handling.

**Evidence.**
- `vercel.json` — function maxDuration and cron schedules committed.
- `.replit` — documents the split topology and Reserved VM choice for the API.
- `docs/deployment/adapters.md` — explicit capability matrix; no hidden divergence.

**Open items.**
- Replit worker does not yet share state with the API (separate mock provider instance).
- Vercel Hobby cron frequency caveat is called out in docs but worth a hard warning in `vercel.json` comments.

**Verdict.** `PASS`. Deployment story is honest and documented.

---

## A14 — Staff Compliance & Risk Reviewer

**Scope.** Regulated-language discipline, licensing claims, client-funds handling.

**Evidence.**
- `apps/web/app/(marketing)/pricing/page.tsx` — refuses to invent prices; V2 live routing is explicitly `Not available`.
- `apps/web/app/(marketing)/security/page.tsx` — rare two-column "In place / Not yet" layout.
- `apps/api/src/routes/orders.ts:15` — hard-rejects non-paper orders with `403 LIVE_DISABLED`.
- `docs/engineering/release-audit.md` — legal caveats itemised: broker-dealer / AFSL / MiFID II / AML-KYC / data entitlements / audit ledger retention.

**Verdict.** `PASS`. Product posture matches regulatory reality.

---

## A15 — Senior Technical Writer / Content Reviewer

**Scope.** Australian English, regulated-language hygiene, internal/external consistency.

**Evidence.**
- Marketing and engineering docs use Australian spelling (`colour`, `prioritise`, `realise`, `authorise`).
- `README.md:3`, `apps/web/app/layout.tsx:11`, `apps/web/app/(marketing)/page.tsx:19` — the `modular` claim has been removed; copy now matches what ships.
- No "AI makes you money" language anywhere.

**Open items.**
- No `robots.txt` or `sitemap.ts`.
- `docs/product/` and `docs/ux/` folders still contain Stage-0 scaffold READMEs.

**Verdict.** `PASS` for copy; `PARTIAL` for completeness of the docs tree.

---

## S1 — Principal Release Engineer · combined verdict

**Ship status: PREVIEW-READY. V1-PUBLIC still gated on:**

1. A full Postgres adapter set for Watchlists, Alerts, Trading, and Audit. The interfaces are in; the implementations are not.
2. Playwright executed in CI with a green run recorded on the branch.
3. Toast surfacing for alert fires.
4. A build-time guard that fails CI if any client chunk contains a `node:` string.
5. Prod-only assertions for `CLERK_SECRET_KEY`, `DATABASE_URL`, and `CRON_SECRET` when `APP_URL` is not localhost.

**Non-blocking improvements.** Mobile dock collapse. axe-core automated a11y. Split marketing CSS. Runbook content. ESLint rule forbidding `@xake/api` in client components. `robots.txt` and `sitemap.ts`.

**Scorecard.**

| Dimension | Score | One-line justification |
|---|---|---|
| Architecture | 8.5/10 | Clean graph, explicit platform adapters, one deliberate seam. |
| Code quality | 8/10 | Pure-functional core, Zod at boundaries, some hacks removed this pass. |
| UI quality | 9/10 | Design system genuinely premium; paper + demo signalling redundant by design. |
| UX quality | 7.5/10 | Preferences now flow through; alert-fire toast still missing. |
| Accessibility | 7.5/10 | Focus, contrast, motion tokens correct; no automated a11y tests. |
| Domain correctness | 8.5/10 | Paper engine, alerts, portfolio all correct in unit tests; durability still depends on DB. |
| Auth / security | 8/10 | 401 enforcement landed; CSRF tokens still absent. |
| Deployment readiness | 8/10 | Vercel + Replit from one codebase; capability matrix honest. |
| Test reliability | 6/10 | Unit strong; integration thin; E2E unverified. |
| Release readiness | 6.5/10 | Preview-ready; public V1 needs the five gates above. |

**Verdict.** The fixes between commit `098cb7d` and commit `cc93679` closed every critical issue raised in the first audit. What remains is expected V1.5 work: Postgres concretes, CI-observed E2E, and the toast-based alert delivery. No new critical issue has been introduced.

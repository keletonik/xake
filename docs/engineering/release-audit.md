# XAKE release audit

Brutally honest snapshot. Updated at the end of each phase. This file is the load-bearing reality check — treat it as the canonical answer whenever someone asks "is X ready".

## Ready

- **Design system and theme engine.** Tokens, three themes, primitive library (including Skeleton, PaperBanner, CommandPalette). Passes basic accessibility.
- **Workspace shell and surfaces.** Dashboard, markets, charts, watchlists, alerts, portfolio, paper ticket, assistant, settings. Command palette (⌘K), paper banner, docked assistant.
- **Paper trading engine.** Deterministic, pure-functional, unit-tested. Validation, slippage, limit-order matching, buying-power enforcement, short-sell block.
- **Alert engine.** Price/percentage/watchlist conditions, SHA-1 dedupe, cooldowns, firing history.
- **Provider abstraction.** Interfaces, canonical models, mock provider, Coinbase public WS adapter.
- **SSE streaming.** Works end-to-end; reconnect handled client-side.
- **Claude assistant.** Server-side only, streaming, six tools, Zod-validated drafts, draft-confirm gating, graceful 429 downgrade to Haiku, mock fallback when no API key.
- **Marketing site.** Landing, features, security, pricing, changelog — built on the same design system.
- **Deployment parity.** Same codebase runs on Vercel (embedded API + cron) and Replit (standalone API + worker), via `@xake/platform` adapters.
- **Docs.** Deployment (local/vercel/replit/adapters), engineering (providers/paper-engine/ai-assistant/streaming/security-boundaries/what-is-mocked), DB schema.

## Blocked

- **Live broker execution.** Requires licensing per jurisdiction. Explicitly disabled in the code.
- **Licensed real-time equity data.** SIP, Nasdaq Basic, proprietary exchange products — vendor contracts and non-display declarations before any production use.
- **Production auth UX beyond Clerk basics.** Step-up auth, MFA enforcement, SSO, audit-linked session events — all deferred.

## Risky (known weak spots)

- **Postgres persistence is a repository shell, not a drop-in.** The interface is defined, one vertical (preferences) is wired. The rest of the in-memory store's behaviour has to be ported row-by-row before any multi-user deployment is safe.
- **State does not survive API restart without `DATABASE_URL`.** Paper ledger, orders, alerts, watchlists all reset.
- **Alert evaluation on Vercel Hobby is effectively broken** (cron runs once per day). Not a code bug; a platform constraint that needs a Pro plan or an external worker.
- **SSE inside Vercel Functions terminates at ~60s.** Browsers reconnect, but the UI shows a momentary "offline" on reconnect. Fine-grained reconnect UX could be better.
- **No persistent upstream WS on Vercel.** If users expect realtime crypto in a Vercel-only deployment, they will be disappointed. The mock provider kicks in silently. Banner messaging is there but worth emphasising more.
- **Clerk "fallback to demo" mode** is safe for dev but makes it very easy to forget to configure Clerk in production. We should add a build-time check for prod deploys without auth.
- **Assistant tool-round-trip is one-way.** The model calls tools, the UI shows drafts, the user confirms. The confirmation does not feed back into the conversation yet, so the assistant can't reason about what was accepted.
- **No e2e proof.** Playwright is scaffolded but not executed in CI.
- **Hono `@xake/api` is imported by Next.js.** The transpile chain is fragile: if `apps/api` grows new Node-only deps without `type: module` discipline, the Next.js mount can break. Keep `apps/api` dependency list tight.

## Mocked or stubbed

- Postgres persistence for all entities except preferences (interface-ready, in-memory today).
- BullMQ + Redis durable queue (`MemoryQueue` only).
- OpenTelemetry + Sentry (`ConsoleObservability` only).
- Full PostgreSQL repository implementations (`PostgresPreferencesRepository` is the template, the rest is TODO).
- News and macro providers (interface-only, no routes).
- Equity curve chart (metrics computed, plot not rendered).
- Chart indicators and drawing tools (toolbar disabled).
- Licensed real-time equity data.
- Partial fills (representable; engine always fills fully).
- Assistant conversation persistence (per-session memory only).
- Prompt caching (ready structurally; not activated).
- Vercel Queues integration.
- Email notification delivery (preference exists; no sender wired).

## Untested

- End-to-end flows (Playwright scaffolded, not executed in this session).
- Multi-user isolation (nothing enforces it because there is no auth-backed persistence yet).
- Cron endpoints under load.
- Assistant fallback path under real 429 conditions.
- Coinbase reconnect on live network blips.
- Chart behaviour on extremely small or extremely large bar counts.
- Clerk middleware behaviour on edge cases (expired tokens, revoked sessions).

## Legal / compliance caveats

If anyone tries to flip this from paper to live, you hit all of the following before a single real order is sensible:

1. **Broker-dealer / AFSL status.** In the US, SEC Rule 15a-6 or registration plus FINRA. In Australia, an AFSL or authorised rep of one, plus DDO obligations. In the EU, MiFID II. None of these are in place.
2. **Data entitlements.** SIP and proprietary exchange data need contracts; non-display declarations apply to server-side use. Crypto "data" is fragmented per venue with its own ToS.
3. **AML / KYC.** Onboarding, sanctions screening, transaction monitoring. Not in code.
4. **Client money / custody.** If XAKE ever holds real client funds, that is a regulated activity of its own. Do not.
5. **Product design and distribution obligations.** Target market determinations, complaint handling, disclosure.
6. **Audit ledger durability.** Needs to be in a DB with append-only semantics and retention before any real-money action can be taken.
7. **Clear risk disclosures.** "This is not investment advice" on every page with a recommendation, every time the assistant drafts.

Until each of those has a real answer, paper-only is the only honest posture.

## Brutal one-line verdict

**XAKE is a polished paper-trading cockpit with a credible co-pilot and a clean platform abstraction. It is shippable as a V1 "analysis + paper" preview product. It is not shippable as a live-trading platform, and nothing in this repo should imply otherwise.**

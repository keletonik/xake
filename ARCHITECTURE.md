# XAKE architecture

Short version: a thin frontend talks to an orchestration API and a stream gateway. Background work lives in a worker. State lives in Postgres and Redis. The AI assistant is a server-side service, never a browser-side caller.

## Service map

```
  ┌────────────────┐        ┌────────────────────┐
  │  Browser (web) │──HTTP──▶  apps/api          │──┐
  │  Next.js       │◀─SSE───│  auth, orchestration│  │
  └───────┬────────┘        └────────┬───────────┘  │
          │                          │              │
          │   WebSocket/SSE          │              │
          ▼                          ▼              ▼
  ┌────────────────┐        ┌────────────────────┐  ┌──────────────────┐
  │ Stream gateway │        │  Postgres           │  │  Redis            │
  │ (in apps/api)  │        │  (Timescale-style)  │  │  cache + queue    │
  └───────┬────────┘        └─────────────────────┘  └────────┬──────────┘
          │                                                    │
          ▼                                                    ▼
  ┌──────────────────────┐                          ┌────────────────────┐
  │ data-core providers  │                          │  apps/worker        │
  │ equities / fx / crypto│                         │  alerts, jobs       │
  │ news / macro         │                          │  notifications      │
  └──────────────────────┘                          └────────────────────┘
```

## Responsibilities

| Service | Owns |
|---|---|
| `apps/web` | Rendering, routing, user interaction, SSE/WS subscriptions. No provider credentials ever. |
| `apps/api` | Auth, entitlements, orchestration, AI service, stream gateway, audit logging. |
| `apps/worker` | Alert evaluation, notification delivery, periodic jobs, backfills. |
| `packages/data-core` | Provider interfaces and normalisers. No UI, no auth. |
| `packages/trading-core` | Order model, paper engine, risk rules. Deterministic and testable. |
| `packages/ai-core` | Prompt templates, tool schemas, guardrails, model routing. |
| `packages/ui` | Design tokens, primitives, composed components. |
| `packages/charts` | Chart wrappers and overlays. |
| `packages/analytics` | Telemetry helpers and audit emitters. |
| `packages/config` | Env schema, feature flags, constants. |

## Environments

- **Paper** is the default and only user-facing trading environment at launch.
- **Live** is a reserved environment type, wired into the data model and type system from the start, but never switched on without regulatory and partner readiness.
- The UI must always declare the active environment. It is not a subtle label — it is a visible, persistent badge.

## Data flow for a quote

1. Provider emits a tick into `data-core`.
2. `data-core` normalises the tick into a canonical `Quote` with `source`, `feedClass`, `ageMs`.
3. Stream gateway in `apps/api` validates subscription entitlement and fans the tick out to subscribers.
4. Browser updates the chart or watchlist row, stamped with source metadata.
5. Worker stores candles and runs alert evaluation against the same canonical stream.

## Deploy targets on Replit

- **Autoscale** for stateless request/response paths on `apps/api` and static serving of `apps/web`.
- **Reserved VM** for the stream gateway and `apps/worker`, because they must stay connected and keep running.
- Secrets live in Replit Secrets with a rotation policy documented in `infra/deployment`.

## Observability

- OpenTelemetry traces from browser to API to worker, correlated by request id.
- Sentry for errors and performance regressions.
- An immutable audit ledger for sign-in, entitlement changes, alert definitions, order drafts, order actions, and AI tool calls.

## Security baseline

- Server-side session validation on every privileged route.
- Row-level security in Postgres for workspace isolation.
- WSS only, origin checks, auth on upgrade, rate limits, size limits.
- No provider keys in browser, no secrets in prompts, no hard-coded credentials.
- Step-up auth reserved for the moment live execution is introduced.

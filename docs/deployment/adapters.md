# Deployment abstraction

One codebase, two targets. This doc explains exactly what differs.

## Platform resolver

`resolveTarget()` in `@xake/platform` returns one of `vercel | replit | node`. Detection order:

1. Explicit `DEPLOY_TARGET`
2. `VERCEL=1` or `VERCEL_URL` → `vercel`
3. `REPL_ID` / `REPLIT_DEPLOYMENT` / `REPLIT_DB_URL` → `replit`
4. Fallback → `node`

The rest of the system reads capabilities through `describeCapabilities(target)`.

## Capability matrix

| Capability | Vercel | Replit | Generic Node |
|---|---|---|---|
| Long-running process | no | yes | yes |
| Upstream WebSocket | no | yes | yes |
| In-process cron | no (use Vercel Cron) | yes | yes |
| Durable queue | Postgres-backed or Vercel Queues (beta) | Redis/BullMQ or in-memory | Redis/BullMQ or in-memory |
| Max stream duration | ~55s (per `vercel.json`) | 1h+ (tunable) | 1h+ |
| Recommended tick interval | 2000ms | 1000ms | 1500ms |
| Secrets location | Vercel env | Replit Secrets | process.env / .env |

## Adapter classes

All in `@xake/platform`:

- `QueueAdapter`, concrete `MemoryQueue` — swap in Redis/BullMQ on long-running hosts.
- `CronAdapter`, concretes `InProcessCronAdapter` (Replit / Node) and `VercelCronAdapter` (Vercel).
- `RealtimeTransport` capability description — used by the stream manager to pick polling vs persistent subscription patterns.
- `ObservabilityAdapter`, concrete `ConsoleObservability` — replace with OTel/Sentry in `@xake/analytics` when Stage 10 lands.

## What the app core assumes

- **The app core does not know whether it is on Vercel or Replit.** Route handlers, React components, and business logic read capabilities via the platform adapter only.
- **Streams are request-scoped from the UI perspective.** The browser always reconnects on disconnect; whether the backend keeps a persistent upstream WS is a backend-internal decision.
- **Secrets are read only on the server.** No `NEXT_PUBLIC_*` leak of sensitive keys.
- **The in-memory store is the default repository.** Postgres activates when `DATABASE_URL` is set; the repository interface in `@xake/db` is authoritative.

## What differs explicitly per target

| Concern | Vercel | Replit |
|---|---|---|
| Cron | `vercel.json` → invokes `/api/v1/cron/*` | `InProcessCronAdapter` inside `apps/worker` |
| Upstream crypto feed | Disabled — function lifetimes don't permit persistent WS | Enabled via `ENABLE_COINBASE_FEED=true` |
| Quote stream | Request-scoped SSE using the mock provider per request | Persistent SSE fed by a shared stream manager |
| Alert evaluation | Cron-polled against last cached prices | Continuous on every tick |
| Observability | Vercel logs + optional OTel export | Console + optional OTel/Sentry |
| Scaling | Serverless, per request | Reserved VM (size to workload) |

If you see a feature behaving differently across environments and it is not listed here, file an issue and note which capability you expected to be uniform.

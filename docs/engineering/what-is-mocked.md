# What is real, what is mocked

Plain-English register of every boundary between shipping code and simulation. Updated every stage.

## Real

- **Design system and theme engine** — real, polished, accessible, shipped.
- **Paper trading engine** — real business logic, deterministic, unit-tested. Orders, fills, positions, balance, realised/unrealised P&L, cancellation, limit-order matching on live ticks.
- **Alert engine** — real evaluation: price-above, price-below, percentage move, watchlist-scoped. Real dedupe (SHA-1 on condition hash), real cooldowns, real firing events with history.
- **Provider abstraction** — real interfaces (`MarketDataProvider`, `NewsProvider`, `MacroCalendarProvider`, `PortfolioSource`, `ExecutionVenue`). Real normalised models.
- **Coinbase public WS quotes** — real realtime feed for BTC/ETH/SOL when `ENABLE_COINBASE_FEED=true`. No auth, no write scope.
- **SSE streaming** — real end-to-end: server fan-out in `streamManager`, Next.js rewrite, browser `EventSource`, backoff reconnect.
- **AI assistant surface** — real SSE streaming, real Claude integration when `ANTHROPIC_API_KEY` is set, real Zod-validated structured outputs, real draft confirmation flow.
- **Audit ledger** — real events emitted for every write. Persistence is in-memory until Postgres is wired.

## Mocked, stubbed, or interface-only

| Area | State | Swap strategy |
|---|---|---|
| Postgres persistence | **In-memory** store mirrors the Postgres schema | Replace `store.ts` with a Postgres repository using the migration in `infra/db/migrations/0001_init.sql` |
| Authentication | **No Clerk yet**; a single demo account is used | Stage 3.5: wire Clerk, bind the demo account to the signed-in user's id |
| Candles from real providers | **Mock** client-side in `charts/mock-adapter.ts`, and mock server-side in the API | Build a server-backed chart adapter that pulls from `GET /v1/instruments/:symbol/candles` and subscribes via SSE |
| News and macro feeds | **Interface only** — no routes yet | Implement providers and add `/v1/news` and `/v1/macro` routes |
| Equity curve chart | **Metrics exposed, no plot rendered** | Add a second Lightweight Charts instance wired to `buildEquityCurve` |
| Indicators, drawings, DOM | **Disabled buttons** in the chart toolbar | Stage 7: EMA/VWAP/RSI and drawing primitives |
| Partial fills | **Representable, not produced** | Split fill logic into a matching engine capable of partials |
| Short-selling | **Disabled by policy** | Remove the guard and add margin accounting when live/margin work begins |
| Live execution | **Hard-disabled server-side** | Stage 8+: broker-specific adapter behind `ExecutionVenue`, gated on licensing |
| Assistant conversation persistence | **In-memory per session** | Stage 8: write to `assistant_conversations` + `assistant_messages` |
| Prompt caching | **Not yet enabled** | Split system vs turn content and mark the system block `cache_control: ephemeral` |
| Worker durability | **In-process evaluator** | Stage 7: BullMQ queues and Redis-backed state |
| Observability | **Console logs only** | Stage 10: OpenTelemetry + Sentry |

## Hard lines we will not cross

- No real-money execution in this repo.
- No unlicensed production market data (SIP, NYSE/Nasdaq proprietary) without a contract.
- No secrets in the browser.
- No autonomous AI trading.

# Data providers

Every external data source implements one of the interfaces in `@xake/data-core/providers/types.ts`:

- `MarketDataProvider` — instruments, quotes, candles, subscriptions
- `NewsProvider` — news items and optional streams
- `MacroCalendarProvider` — upcoming economic events
- `PortfolioSource` — read-only portfolio views from external brokers (Stage 7+)
- `ExecutionVenue` — reserved; no implementation ships in this repo

UI code never imports provider classes. It subscribes to SSE from the API gateway and calls typed endpoints. That boundary is load-bearing — it lets us add, remove, or swap providers without touching the frontend.

## What ships today

| Provider | Status | Use |
|---|---|---|
| `MockMarketDataProvider` | Always on | Dev, tests, demos, fallback |
| `CoinbaseMarketDataProvider` | Behind `ENABLE_COINBASE_FEED=true` | Real-time BTC/ETH/SOL quotes via public WS |
| Twelve Data, Finnhub, Alpaca, Benzinga, Trading Economics | Interfaces only | Wire in later stages once credentials and licensing are settled |

## Adding a provider

1. Create `packages/data-core/src/providers/<name>.ts` implementing `MarketDataProvider` (or the relevant interface).
2. Normalise every outbound object to the canonical types in `types.ts`. Stamp `attribution.source`, `attribution.feedClass`, and `attribution.ageMs` on every quote.
3. Export from `providers/index.ts`.
4. Wire into `apps/api/src/services/stream-manager.ts` with an appropriate symbol-selection rule (regex, asset class, or explicit whitelist).
5. Read credentials from `apps/api/src/env.ts`. Never from the client.
6. Document rate limits, session expiries, reconnect semantics, and any licensing constraints in this file and in the provider class docstring.

## Feed class discipline

`feedClass` communicates data quality:

- `realtime` — licensed real-time from the canonical venue
- `delayed` — real but lagged (IEX, SIP 15-min, etc.)
- `indicative` — non-tradeable reference (OANDA indicative, aggregator averages)
- `mock` — synthetic

The UI reads `feedClass` to render the right badge. Never map `mock` to `realtime` for convenience.

## Stale detection

`isStale(quote, thresholdMs)` from `@xake/data-core` is the canonical check. The stream-manager's per-provider health is the coarse signal; per-quote age is the fine signal. Both surface to the user.

## Licensing reminder

Public exchange feeds (Coinbase, Binance testnet) are fine for prototypes. Licensed data for production (SIP, Nasdaq Basic, proprietary exchange products, commercial news APIs) requires contracts and often non-display declarations. Always verify terms before turning anything on for paying users.

# Streaming architecture

## Path

```
Browser  ──HTTP──▶  apps/web (Next.js)  ──rewrite──▶  apps/api (Hono)
              ◀──SSE──  /v1/stream/quotes  ──▶  streamManager
                                                  ├─ MockMarketDataProvider
                                                  └─ CoinbaseMarketDataProvider (optional)
```

## Transport

Server-Sent Events over HTTP. Chosen because:

- One-way server→client is all we need for quote fan-out.
- Works through HTTP/1.1 and HTTP/2 proxies without WebSocket upgrade complexity.
- Replit's single-external-port constraint is friendlier to SSE than WS multiplexing.
- Reconnect is built into the browser `EventSource` and our hook applies exponential backoff on error.

The API still uses WebSockets upstream to providers (Coinbase). Browsers never see those.

## Endpoints

- `GET /v1/stream/quotes?symbols=AAPL,BTC-USD` — SSE stream. Events: `hello`, `quote`, comment-line `ping` heartbeats every 15 s.
- `POST /v1/assistant/stream` — SSE stream of assistant events: `text_delta`, `tool_use`, `error`, `stop`.

## Quote envelope

Every `quote` event is a normalised `Quote` object with `attribution.source`, `attribution.feedClass`, `attribution.ageMs`, and a server-side `receivedAt`. The UI uses these to render source badges and stale indicators.

## Reconnect and backoff

Client (`lib/use-quote-stream.ts`):

- Reconnects on any `error` event.
- Exponential backoff: 500 ms × 2^attempts, capped at ~32 s.
- Surfaces `connected: boolean` and `staleMs: number` to the caller.

Server (`packages/data-core/providers/coinbase.ts`):

- Reconnects with backoff on close/error.
- Re-sends the subscription set on reconnect.
- Degraded health after 10 s without ticks.

## Fan-out

`streamManager.subscribe(symbols, handler)` manages per-symbol subscriber sets. The `"*"` key receives every tick for broadcast-type use cases (status rail). The same tick stream feeds `store.tickWorkingOrders`, so paper limit orders match immediately when the market crosses.

## Scaling notes (Stage 10)

- Introduce Redis pub/sub for multi-instance fan-out.
- Move long-lived WS upstream connections to a Reserved VM (Replit), keep HTTP/SSE on Autoscale.
- Add session entitlement checks on `hello` and disconnect on revocation.

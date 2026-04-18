# XAKE data model

Physical schema: [`migrations/0001_init.sql`](./migrations/0001_init.sql). Logical types live in `packages/trading-core/src/types.ts` and `packages/data-core/src/types.ts`. The in-memory store in `apps/api/src/lib/store.ts` implements the same shapes so the Postgres swap is mechanical.

## Entities

- **accounts** — one per workspace user. Env pinned to `paper` until live trading is licensed.
- **balances** — currency-keyed cash and buying power per account.
- **instruments** — cached reference data pulled from providers.
- **watchlists / watchlist_items** — user lists with tags, notes, and a pin flag.
- **alerts** — price, percentage, and watchlist-scope conditions. `dedupe_hash` plus a unique constraint on `(account_id, dedupe_hash)` prevents duplicate active alerts. Cooldown is enforced in the evaluator.
- **alert_events** — firing history.
- **orders / fills / positions** — order lifecycle, executions, and derived positions. Positions can be rebuilt from the fill stream; the table is a materialised cache.
- **assistant_conversations / assistant_messages** — durable conversation log. `tool_name`, `tool_input`, `tool_output` capture structured actions for audit.
- **provider_health** — last-seen status per provider.
- **audit_events** — immutable ledger of security-relevant events.

## Invariants enforced at the DB layer

- `orders.side` ∈ `{buy, sell}`; `orders.type` ∈ `{market, limit}`.
- `alerts(account_id, dedupe_hash)` unique → duplicate prevention.
- Every fill links to an order and an account.
- `audit_events` has no UPDATE path in application code.

## Row-level security (Stage 10)

When multi-tenant deployments land, RLS policies will scope every table read/write by `account_id`. The schema uses `account_id` on every user-owned row specifically to make those policies trivial.

## Timescale

For candle storage (Stage 7+), add:

```sql
SELECT create_hypertable('candles', 'open_time');
CREATE MATERIALIZED VIEW candles_1h WITH (timescaledb.continuous) AS ...;
```

This repo ships the table design but leaves the hypertable conversion to the Postgres migration runner in production.

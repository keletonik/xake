# Paper trading engine

Code: `packages/trading-core/src/paper-engine.ts`, `portfolio.ts`, `alerts.ts`.

## Mission

Simulate order execution realistically enough that users practise meaningful discipline — validation, risk, and consequence — without any real money moving. The engine is deterministic, pure-functional, and testable.

## Business rules

1. **Paper only at this stage.** `apps/api/src/routes/orders.ts` rejects any order with `env !== "paper"`. Live remains an interface, not an implementation.
2. **No short-selling.** The engine rejects a sell whose quantity exceeds held position. This is documented policy — we want paper to teach long-side discipline first.
3. **Cash-only buying.** Buy orders that would push cash below zero (including fees) are rejected with `INSUFFICIENT_FUNDS`.
4. **Market orders fill immediately** at `lastPrice ± slippage`, with slippage defaulting to `2 bps` on the aggressive side.
5. **Limit orders fill only when they cross.** Buy limits fill at `min(limit, last)`. Sell limits fill at `max(limit, last)`. Working limit orders are stored as `accepted`; the stream manager's tick-feed matches them on every quote.
6. **Fees** follow a flat `feeBps` on notional. Defaults to `0`.
7. **Positions track weighted-average cost.** Realised P&L is booked on closing trades as `(fillPrice − avgCost) × qty − fees`.
8. **Paper reset** clears cash, positions, orders, fills, and emits an audit event. The UI requires confirmation.

## Validation path

Every incoming draft passes through `validateDraft` (Zod) before reaching `submitOrder`. That gives machine-readable errors (`INVALID_DRAFT`, `LIMIT_PRICE_REQUIRED`, `UNEXPECTED_LIMIT`) alongside the schema errors.

## Assumptions and limits

- Fills are treated as single-shot. Partial fills are representable in the data model (`filledQuantity`, status `partial`) but the current engine always fills the full quantity or none.
- Bid/ask is not used for fill pricing yet; we use `last` and apply slippage. A future iteration can use the touch prices from the quote for a more realistic market order.
- There is no session-awareness. A market order outside the instrument's session still fills. Session-respecting execution is a Stage 7+ refinement.
- There is no wash-sale or tax lot tracking. This is paper — it doesn't need to be a tax engine.

## Testing

`paper-engine.test.ts`, `portfolio.test.ts`, and `alerts.test.ts` cover the core transitions. Anything that changes the fill logic or the portfolio reducer must land with a test.

## Audit

Every status change (`submitted`, `accepted`, `filled`, `rejected`, `cancelled`) and every reset emits an `audit_event` via the store. The Postgres schema has an append-only `audit_events` table to guarantee immutability when persistence lands.

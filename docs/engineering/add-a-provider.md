# Adding a new provider

## Step 1 — Decide the asset class and feed class

- Which of `equity | fx | crypto | futures | index` does this cover?
- Is the feed `realtime`, `delayed`, `indicative`, or is it only a historical store?
- What are the licensing constraints? Write them into the provider's docstring now.

## Step 2 — Implement the interface

Create `packages/data-core/src/providers/<name>.ts` implementing `MarketDataProvider`. The mock and Coinbase adapters are the reference implementations.

Required: every outbound `Quote` stamps `attribution.source`, `attribution.feedClass`, `attribution.venue`, `attribution.ageMs`, and `attribution.receivedAt`.

## Step 3 — Wire into the stream manager

`apps/api/src/services/stream-manager.ts` decides which provider handles which symbols. Add a selection rule — regex, asset class, or explicit whitelist. Keep it small and explicit.

## Step 4 — Secrets

Add credentials to `apps/api/src/env.ts` and `.env.example`. Never to the client.

## Step 5 — Health and reconnect

Implement `health()` and make sure reconnect uses exponential backoff. Expose reconnect count and last-tick timestamp.

## Step 6 — Document

Update `docs/engineering/data-providers.md` with the new entry, and `docs/engineering/what-is-mocked.md` with any boundary the new provider changes.

## Step 7 — Tests

Unit tests for normalisation (inbound payload → canonical `Quote`) are mandatory. Integration tests against a sandbox endpoint are welcome where the provider offers one.

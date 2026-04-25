# Security boundaries

## Server vs browser

- **Server** (`apps/api`, `apps/worker`) holds every secret: Anthropic API key, provider credentials, database URL, Redis URL.
- **Browser** (`apps/web`) holds zero secrets. Its requests go through the Next.js rewrite at `/api/*` to the API, which enforces auth and entitlements.
- The Anthropic SDK is never imported in the browser bundle. Proof: `packages/ai-core` does not depend on `@anthropic-ai/sdk`. The dependency lives only in `apps/api`.

## Live trading

There is no live-trading code path in this repo. The paper engine and the order route hard-reject anything with `env !== "paper"`. `ExecutionVenue` is a reserved interface with no implementation. Any attempt to wire a live broker must land with:

1. A documented licensing and regulatory posture.
2. A step-up auth flow for order actions.
3. RLS policies that scope orders strictly to the authenticated account.
4. A separate SDK for the broker adapter so it can be reviewed on its own.

## AI assistant safety

- Tools propose drafts; the user confirms.
- Every confirm hits the standard, validated API — the assistant has no privileged path.
- Structured outputs are Zod-validated server-side and client-side.
- Every tool call and every confirm is auditable (`assistant_messages` for AI context, `audit_events` for security-relevant changes).
- Prompts forbid fabricated prices/news; the system prompt tells the model to flag uncertainty.

## Secrets lifecycle

- No secret is hard-coded.
- Secrets load via `apps/api/src/env.ts` from `process.env`.
- In production, secrets live in Replit Secrets.
- Rotation runbook: `docs/engineering/replit-assistant.md`.

## Transport

- All traffic over HTTPS in production.
- WebSockets upstream (`wss://`), SSE downstream. Origin-checking is handled by the Hono CORS middleware, scoped to `APP_URL`.
- CORS intentionally lax in dev (`http://localhost:3000`), strict in prod (`APP_URL` only).

## What the audit ledger captures today

- Watchlist create/update/delete/item-add/item-remove.
- Alert create/toggle/delete/fire.
- Paper order submit/accept/fill/reject/cancel.
- Paper balance reset.
- Every assistant tool call with input and output (`assistant_messages`).

## What the audit ledger will capture in Stage 10

- Auth events (sign-in, sign-out, step-up).
- Entitlement changes.
- RLS policy denials.
- Any live-execution interaction if the live path is ever enabled.

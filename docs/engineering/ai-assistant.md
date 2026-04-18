# AI assistant

Code: `packages/ai-core/`, `apps/api/src/services/ai-service.ts`, `apps/api/src/routes/assistant.ts`, `apps/web/app/app/_ui/assistant-dock.tsx`.

## Shape

- Client calls `POST /api/v1/assistant/stream` with `{ messages, context }`.
- The API builds a system prompt with the workspace context appended, calls Anthropic via the SDK with streaming enabled, and forwards events over Server-Sent Events.
- The browser renders text deltas into the active message and collects `tool_use` events as *draft cards* that require explicit user confirmation.
- Nothing mutates trading state until the user clicks **Accept** on a draft — and even then, the action goes through the standard validated API endpoint.

## Context model

`serialiseContext` (in `@xake/ai-core/context.ts`) produces a compact, deterministic text block with the active instrument, timeframe, selected watchlist, a portfolio summary, and recent alerts. It is appended to the system prompt so the assistant conditions on the user's current view.

The context is small by design. Every token costs latency and money. Prompt caching (Stage 8 refinement) will split this into a cached system block and a variable user block.

## Tools

Declared in `@xake/ai-core/tools.ts`:

- `search_instruments` — catalogue lookup
- `summarise_news` — structured news summary
- `build_watchlist` — `WatchlistDraft` returned for user confirmation
- `suggest_alert` — `AlertDraft` returned for user confirmation
- `draft_paper_order` — `OrderDraft` returned for user confirmation
- `explain_chart` — narrative read of the current chart

The assistant's tool outputs become structured drafts. The UI renders each draft with an Accept/Dismiss affordance. Accepting a draft hits the real, validated API endpoint — the assistant has no privileged path.

## Model routing

`selectModel` routes:

- Interactive chat → Sonnet 4.6 (default)
- Summary/classification → Haiku 4.5 (fast)
- Long reasoning with premium flag → Opus 4.7

On 429/503, the AI service downgrades to Haiku for a fallback response and surfaces `rate_limited` to the client.

## Safety rules

1. No autonomous execution. Drafts surface for user confirmation.
2. No browser-side API keys. Secrets live in `apps/api` env only.
3. Structured outputs validated with Zod both server- and client-side before any write.
4. Every tool call is recorded in the assistant conversation log (`assistant_messages.tool_input`, `tool_output`) for audit.
5. The system prompt forbids fabricated prices/news and requires the assistant to flag uncertainty explicitly.
6. The assistant never sees the full live-trading code path because there is no live-trading code path.

## When Claude is not configured

If `ANTHROPIC_API_KEY` is absent, the API falls through to a deterministic mock streamer that writes a terse, sensible reply using the active context. The UI is identical. This keeps local dev productive and removes a class of "it doesn't work on my laptop" bugs.

## Rate-limit handling

The service honours `retry-after` on 429 responses, short-circuits after a small sleep, and downgrades the model rather than stalling. The browser hook distinguishes `streaming` / `idle` / `error` so the UI never silently hangs.

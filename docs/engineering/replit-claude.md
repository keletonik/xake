# Configuring Claude on Replit

## Secrets

Put these in Replit Secrets — never in code, never in the browser bundle, never in commit logs:

- `ANTHROPIC_API_KEY` — required for Claude traffic
- `CLAUDE_DEFAULT_MODEL` — defaults to `claude-sonnet-4-6`
- `CLAUDE_FAST_MODEL` — defaults to `claude-haiku-4-5-20251001`

Optional for the crypto prototype feed:

- `ENABLE_COINBASE_FEED=true`

## Topology

- `apps/web` (Next.js) → Replit **Autoscale**. Stateless pages and API rewrites.
- `apps/api` (Hono) → Replit **Reserved VM**. Maintains upstream WS to providers and streams SSE to browsers; Autoscale's scale-to-zero would interrupt live streams.
- `apps/worker` → Replit **Reserved VM**. Heartbeats alert evaluators.

Replit publishes one external port per service. We front everything through the web origin with a rewrite to the API. Internal ports 4000 (api) and 5000 (worker reserved) stay internal.

## Dev run

```bash
pnpm install
pnpm --filter @xake/api dev     # http://localhost:4000
pnpm --filter @xake/worker dev
pnpm --filter @xake/web dev     # http://localhost:3000
pnpm test                       # runs Vitest across packages
```

If `ANTHROPIC_API_KEY` is not set, the assistant runs against a deterministic mock streamer. Everything else still works.

## Rate-limit behaviour

The AI service reads `retry-after` on 429/503 and downgrades to the fast model rather than stalling. Monitor Anthropic usage dashboards before enabling higher-volume flows. Prompt caching for the system prompt and tool schemas lands in Stage 8 once conversation persistence is wired.

## Secrets rotation

Treat `ANTHROPIC_API_KEY` as rotatable. If compromised:

1. Revoke the key in the Anthropic Console.
2. Update `ANTHROPIC_API_KEY` in Replit Secrets.
3. Restart the `apps/api` Reserved VM.
4. Re-run the assistant page to verify.

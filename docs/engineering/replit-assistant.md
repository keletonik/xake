# Configuring the assistant on Replit

## Secrets

Put these in Replit Secrets. Never in code, never in the browser bundle,
never in commit logs:

- `ASSISTANT_API_KEY` — required for assistant traffic. The legacy
  `ANTHROPIC_API_KEY` name is still accepted as a fallback.
- `ASSISTANT_DEFAULT_MODEL` — defaults to `claude-sonnet-4-6`. Legacy:
  `CLAUDE_DEFAULT_MODEL`.
- `ASSISTANT_FAST_MODEL` — defaults to `claude-haiku-4-5-20251001`.
  Legacy: `CLAUDE_FAST_MODEL`.

Optional, for the crypto prototype feed:

- `ENABLE_COINBASE_FEED=true`

## Topology

- `apps/web` (Next.js) on Replit **Autoscale**. Stateless pages and API
  rewrites.
- `apps/api` (Hono) on Replit **Reserved VM**. Maintains upstream WS to
  providers and streams SSE to browsers. Autoscale's scale-to-zero would
  interrupt live streams.
- `apps/worker` on Replit **Reserved VM**. Heartbeats alert evaluators.

Replit publishes one external port per service. Front everything through
the web origin with a rewrite to the API. Internal ports 4000 (api) and
5000 (worker) stay internal.

## Dev run

```bash
pnpm install
pnpm --filter @xake/api dev     # http://localhost:4000
pnpm --filter @xake/worker dev
pnpm --filter @xake/web dev     # http://localhost:3000
pnpm test                       # vitest across packages
```

If no API key is set, the assistant runs against a deterministic mock
streamer. Everything else still works.

## Rate-limit behaviour

The assistant service reads `retry-after` on 429/503 and downgrades to
the fast model rather than stalling. Watch the provider's usage
dashboard before enabling higher-volume flows. Prompt caching for the
system prompt and tool schemas lands in Stage 8 once conversation
persistence is wired.

## Secrets rotation

Treat `ASSISTANT_API_KEY` as rotatable. If compromised:

1. Revoke the key in the provider console.
2. Update `ASSISTANT_API_KEY` in Replit Secrets.
3. Restart the `apps/api` Reserved VM.
4. Reload the assistant page and confirm.

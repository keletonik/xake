# @xake/api

HTTP API, auth orchestration, stream gateway, and AI service for XAKE.

## Run

```bash
pnpm --filter @xake/api dev
```

Healthcheck: `GET http://localhost:4000/health`.

## Stage 0 scope

Placeholder only. A minimal Node HTTP server answering `/health`. Stages 3–8 flesh this out: Clerk session validation, entitlements, data core gateway, paper engine endpoints, and the Claude assistant service.

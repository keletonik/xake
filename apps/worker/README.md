# @xake/worker

Background worker for alert evaluation, job processing, backfills, and notification delivery.

## Run

```bash
pnpm --filter @xake/worker dev
```

## Stage 0 scope

Placeholder only. Logs a heartbeat every 15 seconds. Stage 7 introduces BullMQ queues, alert evaluation against the canonical stream, dedupe with cooldowns, and delivery channels.

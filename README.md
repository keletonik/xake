# XAKE

**Premium dark-theme trading decision cockpit, Vercel-native.**

Single Next.js 15 App Router app. SSE streams, paper trading engine, Claude assistant, alert evaluator on Vercel Cron.

> Paper environment only. No live execution. AI never places trades.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
```

## Deploy to Vercel

```bash
vercel
vercel env add ANTHROPIC_API_KEY
vercel env add CRON_SECRET
vercel --prod
```

`vercel.json` declares two crons:
- `/api/v1/cron/evaluate-alerts` every 5 minutes
- `/api/v1/cron/health-sweep` every 10 minutes

## Layout

```
app/                  Next.js App Router (pages + api routes)
components/           UI primitives + workspace components
lib/                  data-core, trading-core, alerts, ai, store, config, auth
vercel.json           Cron schedule + function timeouts
```

## Hard constraints

- No live execution.
- No fabricated brokerage.
- No unlicensed realtime data in production.
- AI drafts, humans confirm.
- Paper environment is visually unmistakable.

import { Hono, type Context } from "hono";
import { evaluateQuote, type WatchlistIndex } from "@xake/trading-core";
import { env } from "../env.js";
import { store } from "../lib/store.js";
import { streamManager } from "../services/stream-manager.js";

/**
 * Cron endpoints.
 *
 * - Replit / self-hosted: `apps/worker` runs these continuously in-process.
 * - Vercel: configured via vercel.json to invoke on a schedule.
 *
 * Every endpoint requires the `CRON_SECRET` header when configured.
 * Vercel signs its cron requests with `Authorization: Bearer <CRON_SECRET>`.
 */

export const cronRoutes = new Hono();

const authorised = (c: Context): boolean => {
  if (!env.CRON_SECRET) return true;
  const header = c.req.header("authorization") ?? c.req.header("x-cron-secret") ?? "";
  return header === `Bearer ${env.CRON_SECRET}` || header === env.CRON_SECRET;
};

cronRoutes.get("/v1/cron/evaluate-alerts", (c) => {
  if (!authorised(c)) return c.json({ error: "UNAUTHORIZED" }, 401);

  const allAccounts = store.listAllAccounts();
  let totalFired = 0;
  let totalChecked = 0;

  for (const accountId of allAccounts) {
    const alerts = store.listAlerts(accountId);
    if (alerts.length === 0) continue;

    const watchlistIndex: WatchlistIndex = Object.fromEntries(
      store.listWatchlists(accountId).map((w) => [w.id, w.items.map((i) => i.symbol)])
    );

    const symbols = new Set<string>();
    for (const a of alerts) {
      if ("symbol" in a.condition) symbols.add(a.condition.symbol);
      if (a.condition.kind === "watchlist_any_above") {
        const members = watchlistIndex[a.condition.watchlistId] ?? [];
        members.forEach((s) => symbols.add(s));
      }
    }

    for (const sym of symbols) {
      const last = store.lastPrice(sym);
      if (!last) continue;
      totalChecked += 1;
      const result = evaluateQuote(
        { symbol: sym, last, timestamp: Date.now() },
        alerts,
        watchlistIndex
      );
      for (const fired of result.fired) {
        store.recordAlertEvent(accountId, fired);
        totalFired += 1;
      }
    }
  }

  return c.json({
    ok: true,
    accountsChecked: allAccounts.length,
    symbolsChecked: totalChecked,
    fired: totalFired,
    at: Date.now()
  });
});

cronRoutes.get("/v1/cron/health-sweep", (c) => {
  if (!authorised(c)) return c.json({ error: "UNAUTHORIZED" }, 401);
  const health = streamManager.health();
  store.recordProviderHealth(health);
  return c.json({ ok: true, health });
});

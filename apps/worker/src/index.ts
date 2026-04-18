import { MockMarketDataProvider } from "@xake/data-core";
import { evaluateQuote, type Alert, type AlertEvent, type WatchlistIndex } from "@xake/trading-core";

/**
 * Worker loop. In Stage 7 this becomes a BullMQ worker reading queued
 * evaluation jobs against durable storage. For this combined stage we
 * run the evaluator in-process with the mock feed — the shape is the
 * same, the transport is different.
 *
 * This module subscribes to quotes and evaluates alerts for any accounts
 * passed in via setAlerts(). The API server is the canonical alert
 * store; when you wire the worker to a shared Redis/Postgres in later
 * stages, the server pushes alert updates and the worker drains them.
 */

const provider = new MockMarketDataProvider({ tickIntervalMs: 2000 });
await provider.start();

let alerts: Alert[] = [];
let watchlists: WatchlistIndex = {};
const listeners: Array<(e: AlertEvent) => void> = [];

export const setAlerts = (next: Alert[]) => {
  alerts = next;
};
export const setWatchlists = (next: WatchlistIndex) => {
  watchlists = next;
};
export const onAlertFired = (fn: (e: AlertEvent) => void) => {
  listeners.push(fn);
};

provider.subscribeQuotes([], (q) => {
  if (!alerts.length) return;
  const result = evaluateQuote(
    { symbol: q.symbol, last: q.last, open: q.open, prevClose: q.prevClose, timestamp: q.timestamp },
    alerts,
    watchlists
  );
  for (const fired of result.fired) {
    listeners.forEach((l) => l(fired));
  }
  if (result.updatedAlerts.length) {
    const updatedMap = new Map(result.updatedAlerts.map((a) => [a.id, a]));
    alerts = alerts.map((a) => updatedMap.get(a.id) ?? a);
  }
});

console.log("[xake:worker] alert evaluator running against mock feed");

const beat = setInterval(() => {
  console.log(`[xake:worker] heartbeat alerts=${alerts.length}`);
}, 30_000);

const shutdown = (signal: string) => {
  console.log(`[xake:worker] received ${signal}`);
  clearInterval(beat);
  void provider.stop();
  process.exit(0);
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

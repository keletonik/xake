import crypto from "node:crypto";
import type { Alert, AlertCondition, AlertDraft, AlertEvent } from "./types";

/**
 * Alert evaluation. Pure functions over quote state. The worker loop
 * feeds ticks in; this module decides fire/ignore and formats events.
 *
 * Dedupe: each alert has a dedupeHash derived from its condition.
 * Duplicate alert creation (same account + same condition) is
 * prevented at the store level by checking the hash.
 * Cooldown: after firing, an alert must wait `cooldownSeconds` before
 * firing again.
 */

export const computeDedupeHash = (accountId: string, condition: AlertCondition): string => {
  const canonical = JSON.stringify({ accountId, condition });
  return crypto.createHash("sha1").update(canonical).digest("hex");
};

export interface QuoteSnapshot {
  readonly symbol: string;
  readonly last: number;
  readonly open?: number;
  readonly prevClose?: number;
  readonly timestamp: number;
}

export interface WatchlistIndex {
  readonly [watchlistId: string]: readonly string[];
}

export const isCoolingDown = (alert: Alert, now: number): boolean =>
  !!alert.lastFiredAt && now - alert.lastFiredAt < alert.cooldownSeconds * 1000;

export const matchesCondition = (
  condition: AlertCondition,
  quote: QuoteSnapshot,
  watchlists: WatchlistIndex = {}
): boolean => {
  switch (condition.kind) {
    case "price_above":
      return quote.symbol === condition.symbol && quote.last > condition.threshold;
    case "price_below":
      return quote.symbol === condition.symbol && quote.last < condition.threshold;
    case "pct_move": {
      if (quote.symbol !== condition.symbol) return false;
      const baseline = quote.open ?? quote.prevClose;
      if (baseline === undefined || baseline === 0) return false;
      const pct = ((quote.last - baseline) / baseline) * 100;
      if (condition.direction === "up") return pct >= condition.percent;
      if (condition.direction === "down") return pct <= -Math.abs(condition.percent);
      return Math.abs(pct) >= Math.abs(condition.percent);
    }
    case "watchlist_any_above": {
      const members = watchlists[condition.watchlistId] ?? [];
      return members.includes(quote.symbol) && quote.last > condition.threshold;
    }
  }
};

export interface AlertEvaluationResult {
  readonly fired: AlertEvent[];
  readonly updatedAlerts: Alert[];
}

export const evaluateQuote = (
  quote: QuoteSnapshot,
  alerts: readonly Alert[],
  watchlists: WatchlistIndex,
  now: number = Date.now(),
  idFactory: () => string = () => crypto.randomUUID()
): AlertEvaluationResult => {
  const fired: AlertEvent[] = [];
  const updated: Alert[] = [];
  for (const alert of alerts) {
    if (!alert.active) continue;
    if (isCoolingDown(alert, now)) continue;
    if (alert.expiresAt && now > alert.expiresAt) continue;
    if (!matchesCondition(alert.condition, quote, watchlists)) continue;

    fired.push({
      id: idFactory(),
      alertId: alert.id,
      accountId: alert.accountId,
      firedAt: now,
      triggerPrice: quote.last,
      symbol: quote.symbol,
      note: alert.note
    });
    updated.push({ ...alert, lastFiredAt: now, updatedAt: now });
  }
  return { fired, updatedAlerts: updated };
};

export const buildAlert = (
  draft: AlertDraft,
  accountId: string,
  idFactory: () => string = () => crypto.randomUUID(),
  now: number = Date.now()
): Alert => ({
  ...draft,
  id: idFactory(),
  accountId,
  active: true,
  createdAt: now,
  updatedAt: now,
  dedupeHash: computeDedupeHash(accountId, draft.condition)
});

export const findDuplicate = (
  accountId: string,
  condition: AlertCondition,
  existing: readonly Alert[]
): Alert | undefined => {
  const hash = computeDedupeHash(accountId, condition);
  return existing.find((a) => a.dedupeHash === hash && a.active);
};

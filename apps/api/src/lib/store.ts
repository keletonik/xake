/**
 * In-memory store. The API is designed so the store can be swapped for
 * a Postgres-backed repository without touching routes. Until the
 * Postgres layer lands, this file is the single source of truth for
 * account state. Restart wipes everything — documented in
 * docs/engineering/what-is-mocked.md.
 */

import crypto from "node:crypto";
import type {
  Alert,
  AlertDraft,
  AlertEvent,
  AuditEvent,
  Balance,
  Fill,
  Order,
  PortfolioSnapshot,
  Watchlist,
  WatchlistItem
} from "@xake/trading-core";
import {
  DEFAULT_ENGINE_CONFIG,
  applyFill,
  auditFromOrder,
  buildAlert,
  cancelOrder,
  findDuplicate,
  snapshot,
  submitOrder,
  tryMatchWorkingOrder,
  validateDraft,
  type OrderDraft,
  type PositionMap
} from "@xake/trading-core";

interface Account {
  id: string;
  balance: Balance;
  positions: PositionMap;
  orders: Order[];
  fills: Fill[];
  watchlists: Watchlist[];
  alerts: Alert[];
  alertEvents: AlertEvent[];
  audit: AuditEvent[];
}

const id = () => crypto.randomUUID();

const newAccount = (accountId: string): Account => ({
  id: accountId,
  balance: {
    currency: DEFAULT_ENGINE_CONFIG.currency,
    cash: DEFAULT_ENGINE_CONFIG.startingCash,
    buyingPower: DEFAULT_ENGINE_CONFIG.startingCash
  },
  positions: {},
  orders: [],
  fills: [],
  watchlists: [
    {
      id: id(),
      accountId,
      name: "Radar",
      description: "Default starter list",
      items: [
        { symbol: "AAPL", addedAt: Date.now(), tags: ["tech"], pinned: true },
        { symbol: "NVDA", addedAt: Date.now(), tags: ["tech"], pinned: false },
        { symbol: "BTC-USD", addedAt: Date.now(), tags: ["crypto"], pinned: true }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ],
  alerts: [],
  alertEvents: [],
  audit: []
});

export class Store {
  private accounts = new Map<string, Account>();
  private priceCache = new Map<string, number>();

  getOrCreateAccount(accountId: string): Account {
    let a = this.accounts.get(accountId);
    if (!a) {
      a = newAccount(accountId);
      this.accounts.set(accountId, a);
    }
    return a;
  }

  recordPrice(symbol: string, price: number): void {
    this.priceCache.set(symbol, price);
  }

  lastPrice(symbol: string): number | undefined {
    return this.priceCache.get(symbol);
  }

  getPortfolio(accountId: string): PortfolioSnapshot {
    const a = this.getOrCreateAccount(accountId);
    const prices: Record<string, number> = {};
    for (const sym of Object.keys(a.positions)) {
      const p = this.priceCache.get(sym);
      if (p !== undefined) prices[sym] = p;
    }
    return snapshot(accountId, a.balance, a.positions, prices);
  }

  resetPaperBalance(accountId: string): void {
    const a = this.getOrCreateAccount(accountId);
    a.balance = {
      currency: DEFAULT_ENGINE_CONFIG.currency,
      cash: DEFAULT_ENGINE_CONFIG.startingCash,
      buyingPower: DEFAULT_ENGINE_CONFIG.startingCash
    };
    a.positions = {};
    a.orders = [];
    a.fills = [];
    this.audit(accountId, "paper.reset", undefined, {});
  }

  submitOrder(accountId: string, draft: unknown): { order: Order; fills: Fill[] } | { error: string } {
    const a = this.getOrCreateAccount(accountId);
    const v = validateDraft(draft);
    if ("issue" in v) return { error: `${v.issue.code}: ${v.issue.message}` };
    const d: OrderDraft = v.draft;
    const lastPrice =
      this.priceCache.get(d.symbol) ??
      0; // if we have no price, we will reject below
    if (!lastPrice) return { error: "NO_QUOTE: no recent quote for symbol" };
    const pos = a.positions[d.symbol] ? { qty: a.positions[d.symbol]!.quantity, avgCost: a.positions[d.symbol]!.averageCost } : null;
    const result = submitOrder(
      d,
      accountId,
      { lastPrice },
      DEFAULT_ENGINE_CONFIG,
      pos,
      a.balance,
      id
    );
    a.orders.push(result.order);
    a.fills.push(...result.fills);
    a.balance = { ...a.balance, cash: a.balance.cash + result.balanceDelta, buyingPower: a.balance.cash + result.balanceDelta };
    for (const f of result.fills) {
      a.positions = applyFill(a.positions, f).positions;
    }
    a.audit.push(auditFromOrder(result.order));
    return { order: result.order, fills: result.fills };
  }

  listOrders(accountId: string): Order[] {
    return [...this.getOrCreateAccount(accountId).orders].sort((a, b) => b.createdAt - a.createdAt);
  }

  listFills(accountId: string): Fill[] {
    return [...this.getOrCreateAccount(accountId).fills].sort((a, b) => b.timestamp - a.timestamp);
  }

  cancelOrder(accountId: string, orderId: string): Order | { error: string } {
    const a = this.getOrCreateAccount(accountId);
    const idx = a.orders.findIndex((o) => o.id === orderId);
    if (idx < 0) return { error: "NOT_FOUND" };
    const cancelled = cancelOrder(a.orders[idx]!);
    a.orders[idx] = cancelled;
    a.audit.push(auditFromOrder(cancelled));
    return cancelled;
  }

  tickWorkingOrders(symbol: string, price: number): void {
    this.priceCache.set(symbol, price);
    for (const a of this.accounts.values()) {
      for (let i = 0; i < a.orders.length; i++) {
        const o = a.orders[i]!;
        if (o.symbol !== symbol || o.status !== "accepted") continue;
        const matched = tryMatchWorkingOrder(o, price, DEFAULT_ENGINE_CONFIG, Date.now, id);
        if (!matched) continue;
        a.orders[i] = matched.order;
        a.fills.push(matched.fill);
        a.balance = { ...a.balance, cash: a.balance.cash + matched.balanceDelta, buyingPower: a.balance.cash + matched.balanceDelta };
        a.positions = applyFill(a.positions, matched.fill).positions;
        a.audit.push(auditFromOrder(matched.order));
      }
    }
  }

  listWatchlists(accountId: string): Watchlist[] {
    return this.getOrCreateAccount(accountId).watchlists;
  }

  createWatchlist(accountId: string, name: string, description?: string, items: WatchlistItem[] = []): Watchlist {
    const a = this.getOrCreateAccount(accountId);
    const w: Watchlist = {
      id: id(),
      accountId,
      name,
      description,
      items,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    a.watchlists.push(w);
    this.audit(accountId, "watchlist.create", w.id, { name });
    return w;
  }

  updateWatchlist(accountId: string, watchlistId: string, patch: Partial<Watchlist>): Watchlist | { error: string } {
    const a = this.getOrCreateAccount(accountId);
    const idx = a.watchlists.findIndex((w) => w.id === watchlistId);
    if (idx < 0) return { error: "NOT_FOUND" };
    const current = a.watchlists[idx]!;
    const next: Watchlist = { ...current, ...patch, id: current.id, accountId: current.accountId, updatedAt: Date.now() };
    a.watchlists[idx] = next;
    this.audit(accountId, "watchlist.update", watchlistId);
    return next;
  }

  deleteWatchlist(accountId: string, watchlistId: string): { ok: true } | { error: string } {
    const a = this.getOrCreateAccount(accountId);
    const before = a.watchlists.length;
    a.watchlists = a.watchlists.filter((w) => w.id !== watchlistId);
    if (a.watchlists.length === before) return { error: "NOT_FOUND" };
    this.audit(accountId, "watchlist.delete", watchlistId);
    return { ok: true };
  }

  addWatchlistItem(accountId: string, watchlistId: string, item: WatchlistItem): Watchlist | { error: string } {
    const a = this.getOrCreateAccount(accountId);
    const w = a.watchlists.find((x) => x.id === watchlistId);
    if (!w) return { error: "NOT_FOUND" };
    if (w.items.some((i) => i.symbol.toLowerCase() === item.symbol.toLowerCase())) return w;
    w.items.push(item);
    w.updatedAt = Date.now();
    this.audit(accountId, "watchlist.item.add", watchlistId, { symbol: item.symbol });
    return w;
  }

  removeWatchlistItem(accountId: string, watchlistId: string, symbol: string): Watchlist | { error: string } {
    const a = this.getOrCreateAccount(accountId);
    const w = a.watchlists.find((x) => x.id === watchlistId);
    if (!w) return { error: "NOT_FOUND" };
    w.items = w.items.filter((i) => i.symbol.toLowerCase() !== symbol.toLowerCase());
    w.updatedAt = Date.now();
    this.audit(accountId, "watchlist.item.remove", watchlistId, { symbol });
    return w;
  }

  // ===== Alerts =====

  listAlerts(accountId: string): Alert[] {
    return this.getOrCreateAccount(accountId).alerts;
  }

  listAlertEvents(accountId: string): AlertEvent[] {
    return [...this.getOrCreateAccount(accountId).alertEvents].sort((a, b) => b.firedAt - a.firedAt);
  }

  createAlert(accountId: string, draft: AlertDraft): Alert | { error: string; duplicateOf?: string } {
    const a = this.getOrCreateAccount(accountId);
    const dupe = findDuplicate(accountId, draft.condition, a.alerts);
    if (dupe) return { error: "DUPLICATE_ALERT", duplicateOf: dupe.id };
    const alert = buildAlert(draft, accountId, id);
    a.alerts.push(alert);
    this.audit(accountId, "alert.create", alert.id, { kind: draft.condition.kind });
    return alert;
  }

  toggleAlert(accountId: string, alertId: string, active: boolean): Alert | { error: string } {
    const a = this.getOrCreateAccount(accountId);
    const idx = a.alerts.findIndex((x) => x.id === alertId);
    if (idx < 0) return { error: "NOT_FOUND" };
    a.alerts[idx] = { ...a.alerts[idx]!, active, updatedAt: Date.now() };
    this.audit(accountId, active ? "alert.activate" : "alert.deactivate", alertId);
    return a.alerts[idx]!;
  }

  deleteAlert(accountId: string, alertId: string): { ok: true } | { error: string } {
    const a = this.getOrCreateAccount(accountId);
    const before = a.alerts.length;
    a.alerts = a.alerts.filter((x) => x.id !== alertId);
    if (a.alerts.length === before) return { error: "NOT_FOUND" };
    this.audit(accountId, "alert.delete", alertId);
    return { ok: true };
  }

  recordAlertEvent(accountId: string, event: AlertEvent): void {
    const a = this.getOrCreateAccount(accountId);
    a.alertEvents.push(event);
    const idx = a.alerts.findIndex((x) => x.id === event.alertId);
    if (idx >= 0) {
      a.alerts[idx] = { ...a.alerts[idx]!, lastFiredAt: event.firedAt, updatedAt: event.firedAt };
    }
    this.audit(accountId, "alert.fired", event.alertId, { symbol: event.symbol });
  }

  // ===== Audit =====

  audit(accountId: string, action: string, target?: string, metadata?: Record<string, unknown>): void {
    const a = this.getOrCreateAccount(accountId);
    a.audit.push({
      id: id(),
      accountId,
      actor: "system",
      action,
      target,
      metadata,
      at: Date.now()
    });
    if (a.audit.length > 1000) a.audit = a.audit.slice(-500);
  }

  listAudit(accountId: string): AuditEvent[] {
    return [...this.getOrCreateAccount(accountId).audit].sort((a, b) => b.at - a.at);
  }
}

export const store = new Store();

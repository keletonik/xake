/**
 * Repository interfaces. The in-memory store in apps/api implements
 * these; a Postgres-backed implementation lives in this package for
 * production deployments. The API's route handlers depend on the
 * interface, not the implementation.
 */

import type {
  Alert,
  AlertDraft,
  AlertEvent,
  Fill,
  Order,
  PortfolioSnapshot,
  Watchlist,
  WatchlistItem
} from "@xake/trading-core";

export interface PreferenceRecord {
  readonly accountId: string;
  readonly theme: "dark" | "darker" | "light" | "system";
  readonly timezone?: string;
  readonly defaultSymbol: string;
  readonly defaultTimeframe: string;
  readonly defaultWatchlistId?: string;
  readonly aiEnabled: boolean;
  readonly aiPremiumReasoning: boolean;
  readonly notificationsInApp: boolean;
  readonly notificationsEmail: boolean;
  readonly notificationsWebhook?: string;
  readonly paperStartingCash: number;
}

export interface Repository {
  // Preferences
  getPreferences(accountId: string): Promise<PreferenceRecord>;
  updatePreferences(accountId: string, patch: Partial<PreferenceRecord>): Promise<PreferenceRecord>;

  // Watchlists
  listWatchlists(accountId: string): Promise<Watchlist[]>;
  createWatchlist(accountId: string, name: string, description?: string): Promise<Watchlist>;
  addWatchlistItem(accountId: string, watchlistId: string, item: WatchlistItem): Promise<Watchlist | null>;
  removeWatchlistItem(accountId: string, watchlistId: string, symbol: string): Promise<Watchlist | null>;
  deleteWatchlist(accountId: string, watchlistId: string): Promise<boolean>;

  // Alerts
  listAlerts(accountId: string): Promise<Alert[]>;
  listAlertEvents(accountId: string): Promise<AlertEvent[]>;
  createAlert(accountId: string, draft: AlertDraft): Promise<Alert | { error: "DUPLICATE_ALERT"; duplicateOf: string }>;
  toggleAlert(accountId: string, alertId: string, active: boolean): Promise<Alert | null>;
  deleteAlert(accountId: string, alertId: string): Promise<boolean>;
  recordAlertEvent(accountId: string, event: AlertEvent): Promise<void>;

  // Portfolio / orders
  getPortfolio(accountId: string, prices: Record<string, number>): Promise<PortfolioSnapshot>;
  listOrders(accountId: string): Promise<Order[]>;
  listFills(accountId: string): Promise<Fill[]>;
  submitOrder(accountId: string, draft: unknown, lastPrice: number): Promise<{ order: Order; fills: Fill[] } | { error: string }>;
  cancelOrder(accountId: string, orderId: string): Promise<Order | null>;
  resetPaperBalance(accountId: string): Promise<void>;
  tickWorkingOrders(symbol: string, price: number): Promise<void>;

  // Internal
  listAllAccounts(): Promise<string[]>;
  lastPrice(symbol: string): Promise<number | undefined>;
  recordPrice(symbol: string, price: number): Promise<void>;
}

/**
 * Postgres repository skeleton. Only preferences are implemented here
 * — the full migration of the in-memory store to Postgres is scheduled
 * for the persistence hardening stage. Everything else documented in
 * docs/engineering/what-is-mocked.md. The interface above is the
 * canonical contract both implementations honour.
 */
export { PostgresPreferencesRepository } from "./postgres-preferences.js";

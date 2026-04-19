import type {
  Alert,
  AlertDraft,
  AlertEvent,
  AuditEvent,
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

export interface WatchlistRepo {
  list(accountId: string): Promise<Watchlist[]>;
  create(accountId: string, name: string, description?: string): Promise<Watchlist>;
  update(accountId: string, id: string, patch: Partial<Watchlist>): Promise<Watchlist | null>;
  remove(accountId: string, id: string): Promise<boolean>;
  addItem(accountId: string, id: string, item: WatchlistItem): Promise<Watchlist | null>;
  removeItem(accountId: string, id: string, symbol: string): Promise<Watchlist | null>;
}

export interface AlertRepo {
  list(accountId: string): Promise<Alert[]>;
  history(accountId: string): Promise<AlertEvent[]>;
  create(accountId: string, draft: AlertDraft): Promise<Alert | { error: "DUPLICATE_ALERT"; duplicateOf: string }>;
  toggle(accountId: string, id: string, active: boolean): Promise<Alert | null>;
  remove(accountId: string, id: string): Promise<boolean>;
  recordEvent(accountId: string, event: AlertEvent): Promise<void>;
}

export interface TradingRepo {
  portfolio(accountId: string, prices: Record<string, number>): Promise<PortfolioSnapshot>;
  listOrders(accountId: string): Promise<Order[]>;
  listFills(accountId: string): Promise<Fill[]>;
  submit(accountId: string, draft: unknown, lastPrice: number): Promise<{ order: Order; fills: Fill[] } | { error: string }>;
  cancel(accountId: string, orderId: string): Promise<Order | null>;
  reset(accountId: string): Promise<void>;
  tickWorking(symbol: string, price: number): Promise<void>;
}

export interface PreferenceRepo {
  get(accountId: string): Promise<PreferenceRecord>;
  update(accountId: string, patch: Partial<PreferenceRecord>): Promise<PreferenceRecord>;
}

export interface AuditRepo {
  append(event: AuditEvent): Promise<void>;
  list(accountId: string): Promise<AuditEvent[]>;
}

export interface Repository {
  readonly kind: "memory" | "postgres";
  readonly watchlists: WatchlistRepo;
  readonly alerts: AlertRepo;
  readonly trading: TradingRepo;
  readonly preferences: PreferenceRepo;
  readonly audit: AuditRepo;
  lastPrice(symbol: string): Promise<number | undefined>;
  recordPrice(symbol: string, price: number): Promise<void>;
  accounts(): Promise<string[]>;
}

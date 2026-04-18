import { z } from "zod";

export type TradeEnvironment = "paper" | "live";

export const OrderSideSchema = z.enum(["buy", "sell"]);
export type OrderSide = z.infer<typeof OrderSideSchema>;

export const OrderTypeSchema = z.enum(["market", "limit"]);
export type OrderType = z.infer<typeof OrderTypeSchema>;

export const TimeInForceSchema = z.enum(["day", "gtc", "ioc"]);
export type TimeInForce = z.infer<typeof TimeInForceSchema>;

export const OrderStatusSchema = z.enum([
  "draft",
  "submitted",
  "accepted",
  "partial",
  "filled",
  "cancelled",
  "rejected"
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderDraftSchema = z.object({
  symbol: z.string().min(1),
  side: OrderSideSchema,
  type: OrderTypeSchema,
  quantity: z.number().positive(),
  limitPrice: z.number().positive().optional(),
  tif: TimeInForceSchema.default("day"),
  env: z.literal("paper").default("paper"),
  reason: z.string().max(1000).optional()
});
export type OrderDraft = z.infer<typeof OrderDraftSchema>;

export interface Order {
  readonly id: string;
  readonly accountId: string;
  readonly env: TradeEnvironment;
  readonly symbol: string;
  readonly side: OrderSide;
  readonly type: OrderType;
  readonly quantity: number;
  readonly limitPrice?: number;
  readonly tif: TimeInForce;
  readonly status: OrderStatus;
  readonly filledQuantity: number;
  readonly avgFillPrice?: number;
  readonly rejectionReason?: string;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly reason?: string;
}

export interface Fill {
  readonly id: string;
  readonly orderId: string;
  readonly accountId: string;
  readonly symbol: string;
  readonly side: OrderSide;
  readonly quantity: number;
  readonly price: number;
  readonly fee: number;
  readonly timestamp: number;
}

export interface Position {
  readonly symbol: string;
  readonly quantity: number;
  readonly averageCost: number;
  readonly realisedPnl: number;
  readonly lastPrice?: number;
  readonly unrealisedPnl?: number;
  readonly marketValue?: number;
}

export interface Balance {
  readonly currency: string;
  readonly cash: number;
  readonly buyingPower: number;
}

export interface PortfolioSnapshot {
  readonly accountId: string;
  readonly env: TradeEnvironment;
  readonly balance: Balance;
  readonly positions: Position[];
  readonly totalEquity: number;
  readonly totalRealisedPnl: number;
  readonly totalUnrealisedPnl: number;
  readonly asOf: number;
}

export interface EquityPoint {
  readonly timestamp: number;
  readonly equity: number;
}

// ===== Alerts =====

export const AlertConditionSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("price_above"), symbol: z.string(), threshold: z.number() }),
  z.object({ kind: z.literal("price_below"), symbol: z.string(), threshold: z.number() }),
  z.object({
    kind: z.literal("pct_move"),
    symbol: z.string(),
    percent: z.number(),
    direction: z.enum(["up", "down", "any"]).default("any")
  }),
  z.object({
    kind: z.literal("watchlist_any_above"),
    watchlistId: z.string(),
    threshold: z.number()
  })
]);
export type AlertCondition = z.infer<typeof AlertConditionSchema>;

export const AlertDraftSchema = z.object({
  name: z.string().min(1).max(120),
  condition: AlertConditionSchema,
  channels: z.array(z.enum(["in_app", "email", "webhook"])).default(["in_app"]),
  cooldownSeconds: z.number().int().positive().max(86_400).default(300),
  expiresAt: z.number().int().positive().optional(),
  note: z.string().max(1000).optional()
});
export type AlertDraft = z.infer<typeof AlertDraftSchema>;

export interface Alert extends AlertDraft {
  readonly id: string;
  readonly accountId: string;
  readonly active: boolean;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly lastFiredAt?: number;
  readonly dedupeHash: string;
}

export interface AlertEvent {
  readonly id: string;
  readonly alertId: string;
  readonly accountId: string;
  readonly firedAt: number;
  readonly triggerPrice: number;
  readonly symbol: string;
  readonly note?: string;
}

// ===== Watchlists =====

export const WatchlistItemSchema = z.object({
  symbol: z.string(),
  addedAt: z.number().int().positive(),
  tags: z.array(z.string()).default([]),
  note: z.string().max(500).optional(),
  pinned: z.boolean().default(false)
});
export type WatchlistItem = z.infer<typeof WatchlistItemSchema>;

export const WatchlistSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  items: z.array(WatchlistItemSchema).default([]),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive()
});
export type Watchlist = z.infer<typeof WatchlistSchema>;

// ===== Audit =====

export interface AuditEvent {
  readonly id: string;
  readonly accountId?: string;
  readonly actor: string;
  readonly action: string;
  readonly target?: string;
  readonly metadata?: Record<string, unknown>;
  readonly at: number;
}

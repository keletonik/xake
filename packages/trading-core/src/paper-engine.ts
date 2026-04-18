import type {
  Balance,
  Fill,
  Order,
  OrderDraft,
  OrderStatus
} from "./types";
import { OrderDraftSchema } from "./types";

/**
 * Paper trading engine.
 *
 * Business rules:
 *   1. The engine never mutates external state. It returns new objects.
 *   2. Validation runs before any state transition. Invalid submissions
 *      become "rejected" orders with a machine-readable reason.
 *   3. Market orders fill immediately at the provided quote price,
 *      plus configurable bps slippage on the aggressive side.
 *   4. Limit orders only fill when the incoming quote crosses the
 *      limit price (buy ≤ limit, sell ≥ limit).
 *   5. Every fill updates cash and positions atomically. We never
 *      allow cash to go below zero for buys (rejected), and never
 *      allow selling more than held (rejected).
 *   6. Fees are a simple bps model on notional — 0 by default.
 *
 * All assumptions are documented in docs/engineering/paper-engine.md.
 */

export interface FillContext {
  readonly lastPrice: number;
  readonly now?: number;
}

export interface EngineConfig {
  readonly slippageBps: number;
  readonly feeBps: number;
  readonly startingCash: number;
  readonly currency: string;
}

export const DEFAULT_ENGINE_CONFIG: EngineConfig = {
  slippageBps: 2,
  feeBps: 0,
  startingCash: 100_000,
  currency: "USD"
};

export type ValidationIssue = { code: string; message: string };

export const validateDraft = (draft: unknown): { draft: OrderDraft } | { issue: ValidationIssue } => {
  const parsed = OrderDraftSchema.safeParse(draft);
  if (!parsed.success) {
    return {
      issue: {
        code: "INVALID_DRAFT",
        message: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
      }
    };
  }
  const d = parsed.data;
  if (d.type === "limit" && !d.limitPrice) {
    return { issue: { code: "LIMIT_PRICE_REQUIRED", message: "Limit orders require a limitPrice" } };
  }
  if (d.type === "market" && d.limitPrice !== undefined) {
    return { issue: { code: "UNEXPECTED_LIMIT", message: "Market orders must not include limitPrice" } };
  }
  return { draft: d };
};

export interface SubmitResult {
  readonly order: Order;
  readonly fills: Fill[];
  readonly balanceDelta: number;
  readonly fees: number;
}

export const submitOrder = (
  draft: OrderDraft,
  accountId: string,
  context: FillContext,
  config: EngineConfig,
  openPosition: { qty: number; avgCost: number } | null,
  balance: Balance,
  idFactory: () => string,
  now: () => number = () => Date.now()
): SubmitResult => {
  const ts = now();
  const baseOrder: Order = {
    id: idFactory(),
    accountId,
    env: "paper",
    symbol: draft.symbol,
    side: draft.side,
    type: draft.type,
    quantity: draft.quantity,
    limitPrice: draft.limitPrice,
    tif: draft.tif,
    status: "submitted",
    filledQuantity: 0,
    createdAt: ts,
    updatedAt: ts,
    reason: draft.reason
  };

  // Market orders fill immediately. Limit orders that already cross
  // also fill; otherwise they sit as "accepted" for later matching.
  const crosses =
    draft.type === "market" ||
    (draft.side === "buy" && context.lastPrice <= (draft.limitPrice ?? Infinity)) ||
    (draft.side === "sell" && context.lastPrice >= (draft.limitPrice ?? -Infinity));

  if (!crosses) {
    return {
      order: { ...baseOrder, status: "accepted", updatedAt: ts },
      fills: [],
      balanceDelta: 0,
      fees: 0
    };
  }

  const slip = (config.slippageBps / 10_000) * context.lastPrice;
  const fillPrice =
    draft.type === "market"
      ? draft.side === "buy"
        ? context.lastPrice + slip
        : context.lastPrice - slip
      : // Limit: fill at the better of limit and last
        draft.side === "buy"
          ? Math.min(draft.limitPrice ?? context.lastPrice, context.lastPrice)
          : Math.max(draft.limitPrice ?? context.lastPrice, context.lastPrice);

  const notional = fillPrice * draft.quantity;
  const fee = (config.feeBps / 10_000) * notional;

  // Buying power check
  if (draft.side === "buy" && balance.cash < notional + fee) {
    return rejection(baseOrder, ts, "INSUFFICIENT_FUNDS", `Need ${(notional + fee).toFixed(2)} ${config.currency}, have ${balance.cash.toFixed(2)}`);
  }
  // Short-sell prevention (paper engine is long-only for now)
  if (draft.side === "sell") {
    const held = openPosition?.qty ?? 0;
    if (held < draft.quantity) {
      return rejection(baseOrder, ts, "INSUFFICIENT_INVENTORY", `Short selling disabled in paper. Held ${held}, tried to sell ${draft.quantity}`);
    }
  }

  const fill: Fill = {
    id: idFactory(),
    orderId: baseOrder.id,
    accountId,
    symbol: draft.symbol,
    side: draft.side,
    quantity: draft.quantity,
    price: fillPrice,
    fee,
    timestamp: ts
  };

  const delta = draft.side === "buy" ? -(notional + fee) : notional - fee;

  const filledOrder: Order = {
    ...baseOrder,
    status: "filled",
    filledQuantity: draft.quantity,
    avgFillPrice: fillPrice,
    updatedAt: ts
  };

  return {
    order: filledOrder,
    fills: [fill],
    balanceDelta: delta,
    fees: fee
  };
};

const rejection = (
  base: Order,
  ts: number,
  code: string,
  message: string
): SubmitResult => ({
  order: { ...base, status: "rejected" as OrderStatus, rejectionReason: `${code}: ${message}`, updatedAt: ts },
  fills: [],
  balanceDelta: 0,
  fees: 0
});

/**
 * Evaluate whether a working limit order now crosses with the latest tick.
 * Returns a fill if so, or null. Used by the streaming evaluator.
 */
export const tryMatchWorkingOrder = (
  order: Order,
  lastPrice: number,
  config: EngineConfig,
  now: () => number,
  idFactory: () => string
): { order: Order; fill: Fill; balanceDelta: number } | null => {
  if (order.status !== "accepted" || order.type !== "limit" || order.limitPrice === undefined) {
    return null;
  }
  const crosses =
    (order.side === "buy" && lastPrice <= order.limitPrice) ||
    (order.side === "sell" && lastPrice >= order.limitPrice);
  if (!crosses) return null;

  const fillPrice =
    order.side === "buy" ? Math.min(order.limitPrice, lastPrice) : Math.max(order.limitPrice, lastPrice);
  const ts = now();
  const notional = fillPrice * order.quantity;
  const fee = (config.feeBps / 10_000) * notional;
  const delta = order.side === "buy" ? -(notional + fee) : notional - fee;

  const fill: Fill = {
    id: idFactory(),
    orderId: order.id,
    accountId: order.accountId,
    symbol: order.symbol,
    side: order.side,
    quantity: order.quantity,
    price: fillPrice,
    fee,
    timestamp: ts
  };

  const filled: Order = {
    ...order,
    status: "filled",
    filledQuantity: order.quantity,
    avgFillPrice: fillPrice,
    updatedAt: ts
  };

  return { order: filled, fill, balanceDelta: delta };
};

export const cancelOrder = (order: Order, now: () => number = () => Date.now()): Order => {
  if (order.status === "filled" || order.status === "cancelled" || order.status === "rejected") {
    return order;
  }
  return { ...order, status: "cancelled", updatedAt: now() };
};

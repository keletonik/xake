import type { AuditEvent, Fill, Order } from "./types";

/**
 * A minimal event-sourced ledger for paper activity. The canonical
 * facts are the stream of orders and fills. Any derived view — the
 * portfolio snapshot, the equity curve, the activity feed — rebuilds
 * itself by replaying events.
 */

export type LedgerEvent =
  | { kind: "order_submitted"; order: Order; at: number }
  | { kind: "order_accepted"; orderId: string; at: number }
  | { kind: "order_filled"; orderId: string; fills: Fill[]; at: number }
  | { kind: "order_cancelled"; orderId: string; at: number }
  | { kind: "order_rejected"; orderId: string; reason: string; at: number }
  | { kind: "balance_adjusted"; delta: number; reason: string; at: number }
  | { kind: "audit"; audit: AuditEvent; at: number };

export const auditFromOrder = (order: Order, actor = "user"): AuditEvent => ({
  id: `audit_${order.id}`,
  accountId: order.accountId,
  actor,
  action: `order.${order.status}`,
  target: order.id,
  metadata: {
    symbol: order.symbol,
    side: order.side,
    type: order.type,
    quantity: order.quantity,
    limitPrice: order.limitPrice,
    env: order.env
  },
  at: order.updatedAt
});

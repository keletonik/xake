import { describe, expect, it } from "vitest";
import {
  DEFAULT_ENGINE_CONFIG,
  cancelOrder,
  submitOrder,
  tryMatchWorkingOrder,
  validateDraft
} from "./paper-engine";
import type { Balance, OrderDraft } from "./types";

const nextId = () => {
  let n = 0;
  return () => `id-${++n}`;
};

const balance = (cash = 10_000): Balance => ({
  currency: "USD",
  cash,
  buyingPower: cash
});

describe("paper-engine", () => {
  it("rejects invalid drafts", () => {
    const v = validateDraft({ symbol: "", side: "buy", type: "market", quantity: -1 });
    expect("issue" in v).toBe(true);
  });

  it("requires limitPrice for limit orders", () => {
    const v = validateDraft({ symbol: "AAPL", side: "buy", type: "limit", quantity: 1 });
    expect("issue" in v).toBe(true);
  });

  it("fills a market buy immediately and deducts cash with slippage", () => {
    const draft: OrderDraft = { symbol: "AAPL", side: "buy", type: "market", quantity: 10, tif: "day", env: "paper" };
    const id = nextId();
    const r = submitOrder(draft, "acc", { lastPrice: 100 }, DEFAULT_ENGINE_CONFIG, null, balance(), id);
    expect(r.order.status).toBe("filled");
    expect(r.fills).toHaveLength(1);
    // slippage 2bps → price slightly above 100
    expect(r.fills[0]!.price).toBeGreaterThanOrEqual(100);
    expect(r.balanceDelta).toBeLessThan(0);
  });

  it("rejects a buy when cash is insufficient", () => {
    const draft: OrderDraft = { symbol: "AAPL", side: "buy", type: "market", quantity: 100, tif: "day", env: "paper" };
    const r = submitOrder(draft, "acc", { lastPrice: 1000 }, DEFAULT_ENGINE_CONFIG, null, balance(1000), nextId());
    expect(r.order.status).toBe("rejected");
    expect(r.order.rejectionReason).toContain("INSUFFICIENT_FUNDS");
  });

  it("rejects a sell when inventory is insufficient (no shorting in paper)", () => {
    const draft: OrderDraft = { symbol: "AAPL", side: "sell", type: "market", quantity: 5, tif: "day", env: "paper" };
    const r = submitOrder(draft, "acc", { lastPrice: 100 }, DEFAULT_ENGINE_CONFIG, null, balance(), nextId());
    expect(r.order.status).toBe("rejected");
    expect(r.order.rejectionReason).toContain("INSUFFICIENT_INVENTORY");
  });

  it("keeps limit orders working when price does not cross", () => {
    const draft: OrderDraft = { symbol: "AAPL", side: "buy", type: "limit", quantity: 1, limitPrice: 90, tif: "day", env: "paper" };
    const r = submitOrder(draft, "acc", { lastPrice: 100 }, DEFAULT_ENGINE_CONFIG, null, balance(), nextId());
    expect(r.order.status).toBe("accepted");
    expect(r.fills).toHaveLength(0);
  });

  it("fills a working limit buy when the market crosses", () => {
    const working = submitOrder(
      { symbol: "AAPL", side: "buy", type: "limit", quantity: 1, limitPrice: 90, tif: "day", env: "paper" },
      "acc",
      { lastPrice: 100 },
      DEFAULT_ENGINE_CONFIG,
      null,
      balance(),
      nextId()
    ).order;
    const match = tryMatchWorkingOrder(working, 89, DEFAULT_ENGINE_CONFIG, () => 1, nextId());
    expect(match).not.toBeNull();
    expect(match!.order.status).toBe("filled");
    expect(match!.fill.price).toBeLessThanOrEqual(90);
  });

  it("cancels an accepted order", () => {
    const o = submitOrder(
      { symbol: "AAPL", side: "buy", type: "limit", quantity: 1, limitPrice: 1, tif: "day", env: "paper" },
      "acc",
      { lastPrice: 100 },
      DEFAULT_ENGINE_CONFIG,
      null,
      balance(),
      nextId()
    ).order;
    const cancelled = cancelOrder(o, () => 2);
    expect(cancelled.status).toBe("cancelled");
  });
});

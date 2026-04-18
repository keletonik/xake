import { describe, expect, it } from "vitest";
import { applyFill, applyFills, snapshot } from "./portfolio";
import type { Fill } from "./types";

const fill = (over: Partial<Fill> = {}): Fill => ({
  id: "f",
  orderId: "o",
  accountId: "acc",
  symbol: "AAPL",
  side: "buy",
  quantity: 10,
  price: 100,
  fee: 0,
  timestamp: 1,
  ...over
});

describe("portfolio", () => {
  it("opens a new position on first buy", () => {
    const r = applyFill({}, fill());
    expect(r.positions.AAPL!.quantity).toBe(10);
    expect(r.positions.AAPL!.averageCost).toBe(100);
  });

  it("accumulates average cost on subsequent buys", () => {
    const state = applyFills({}, [
      fill({ quantity: 10, price: 100 }),
      fill({ quantity: 10, price: 120 })
    ]);
    expect(state.AAPL!.quantity).toBe(20);
    expect(state.AAPL!.averageCost).toBe(110);
  });

  it("realises P&L on sells at the weighted-average cost", () => {
    const state = applyFills({}, [
      fill({ quantity: 10, price: 100 }),
      fill({ quantity: 10, price: 120 })
    ]);
    const next = applyFill(state, fill({ side: "sell", quantity: 5, price: 130, fee: 0 }));
    expect(next.positions.AAPL!.quantity).toBe(15);
    // realised = (130 - 110) * 5 = 100
    expect(next.positions.AAPL!.realisedPnl).toBe(100);
  });

  it("refuses oversold sells", () => {
    expect(() => applyFill({}, fill({ side: "sell", quantity: 1 }))).toThrow();
  });

  it("produces a snapshot with unrealised P&L priced from the tick", () => {
    const state = applyFills({}, [fill({ quantity: 10, price: 100 })]);
    const snap = snapshot(
      "acc",
      { currency: "USD", cash: 5000, buyingPower: 5000 },
      state,
      { AAPL: 110 },
      1
    );
    expect(snap.totalUnrealisedPnl).toBe(100);
    // equity = cash 5000 + market value 1100
    expect(snap.totalEquity).toBe(6100);
  });
});

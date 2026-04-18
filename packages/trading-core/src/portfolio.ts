import type {
  Balance,
  EquityPoint,
  Fill,
  Order,
  PortfolioSnapshot,
  Position
} from "./types";

/**
 * Portfolio reducer. Given a starting balance and an ordered fill
 * stream, produces positions, average cost, realised P&L. Unrealised
 * P&L is computed from a price map at snapshot time.
 */

export interface PositionMap {
  [symbol: string]: Position;
}

export const applyFill = (
  positions: PositionMap,
  fill: Fill
): { positions: PositionMap; realisedDelta: number } => {
  const existing = positions[fill.symbol];
  if (fill.side === "buy") {
    if (!existing || existing.quantity === 0) {
      const next: Position = {
        symbol: fill.symbol,
        quantity: fill.quantity,
        averageCost: fill.price,
        realisedPnl: existing?.realisedPnl ?? 0
      };
      return { positions: { ...positions, [fill.symbol]: next }, realisedDelta: 0 };
    }
    const totalCost = existing.averageCost * existing.quantity + fill.price * fill.quantity;
    const qty = existing.quantity + fill.quantity;
    const next: Position = {
      ...existing,
      quantity: qty,
      averageCost: totalCost / qty
    };
    return { positions: { ...positions, [fill.symbol]: next }, realisedDelta: 0 };
  }

  // Sell
  if (!existing || existing.quantity < fill.quantity) {
    throw new Error(`Cannot sell ${fill.quantity} of ${fill.symbol} — held ${existing?.quantity ?? 0}`);
  }
  const realised = (fill.price - existing.averageCost) * fill.quantity - fill.fee;
  const qty = existing.quantity - fill.quantity;
  const next: Position = {
    ...existing,
    quantity: qty,
    averageCost: qty === 0 ? 0 : existing.averageCost,
    realisedPnl: existing.realisedPnl + realised
  };
  return { positions: { ...positions, [fill.symbol]: next }, realisedDelta: realised };
};

export const applyFills = (start: PositionMap, fills: readonly Fill[]): PositionMap => {
  let state = start;
  for (const f of fills) {
    state = applyFill(state, f).positions;
  }
  return state;
};

export const snapshot = (
  accountId: string,
  balance: Balance,
  positions: PositionMap,
  prices: Record<string, number | undefined>,
  now: number = Date.now()
): PortfolioSnapshot => {
  const enriched: Position[] = [];
  let unrealised = 0;
  let realisedTotal = 0;
  for (const p of Object.values(positions)) {
    if (p.quantity === 0 && p.realisedPnl === 0) continue;
    const last = prices[p.symbol];
    const marketValue = last !== undefined ? last * p.quantity : undefined;
    const upnl = last !== undefined ? (last - p.averageCost) * p.quantity : undefined;
    enriched.push({
      ...p,
      lastPrice: last,
      marketValue,
      unrealisedPnl: upnl
    });
    if (upnl !== undefined) unrealised += upnl;
    realisedTotal += p.realisedPnl;
  }
  const positionsValue = enriched.reduce((acc, p) => acc + (p.marketValue ?? 0), 0);
  return {
    accountId,
    env: "paper",
    balance,
    positions: enriched,
    totalEquity: balance.cash + positionsValue,
    totalRealisedPnl: realisedTotal,
    totalUnrealisedPnl: unrealised,
    asOf: now
  };
};

export const buildEquityCurve = (
  startingCash: number,
  fills: readonly Fill[],
  pricePath: Record<string, ReadonlyArray<{ ts: number; price: number }>>,
  bucketMs = 60_000
): EquityPoint[] => {
  // Simplified equity curve for the paper ledger. Buckets by minute.
  if (fills.length === 0) return [{ timestamp: Date.now(), equity: startingCash }];
  const end = Date.now();
  const start = fills[0]!.timestamp;
  let cash = startingCash;
  let positions: PositionMap = {};
  const sortedFills = [...fills].sort((a, b) => a.timestamp - b.timestamp);
  const points: EquityPoint[] = [];
  let fillIdx = 0;
  for (let t = start; t <= end; t += bucketMs) {
    while (fillIdx < sortedFills.length && sortedFills[fillIdx]!.timestamp <= t) {
      const f = sortedFills[fillIdx]!;
      const delta = f.side === "buy" ? -(f.price * f.quantity + f.fee) : f.price * f.quantity - f.fee;
      cash += delta;
      positions = applyFill(positions, f).positions;
      fillIdx += 1;
    }
    let positionsValue = 0;
    for (const [sym, p] of Object.entries(positions)) {
      const series = pricePath[sym];
      if (!series || !p.quantity) continue;
      const latest = nearestPrice(series, t);
      if (latest !== undefined) positionsValue += latest * p.quantity;
    }
    points.push({ timestamp: t, equity: cash + positionsValue });
  }
  return points;
};

const nearestPrice = (
  series: ReadonlyArray<{ ts: number; price: number }>,
  t: number
): number | undefined => {
  let lastPrice: number | undefined;
  for (const pt of series) {
    if (pt.ts <= t) lastPrice = pt.price;
    else break;
  }
  return lastPrice;
};

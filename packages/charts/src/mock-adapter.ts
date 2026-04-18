import type { Candle, Timeframe } from "@xake/data-core";
import { TIMEFRAME_SECONDS, mergeTickIntoCandle } from "@xake/data-core";
import type { ChartDataAdapter } from "./adapter";

/**
 * Client-side mock chart adapter. Deterministically synthesises history
 * and then drifts forward on a timer. Replaced by a real adapter in a
 * later stage that subscribes to the API's SSE stream.
 */

const rng = (seed: number) => {
  let s = seed;
  return () => {
    s = Math.imul(48271, s) % 0x7fffffff;
    return s / 0x7fffffff;
  };
};

export class MockChartAdapter implements ChartDataAdapter {
  readonly name = "mock";
  private readonly prices = new Map<string, number>();

  async loadCandles(symbol: string, timeframe: Timeframe, limit: number): Promise<Candle[]> {
    const secs = TIMEFRAME_SECONDS[timeframe];
    const now = Math.floor(Date.now() / 1000);
    const r = rng(hash(symbol));
    const base = seedBasePrice(symbol);
    let price = base;
    const candles: Candle[] = [];
    for (let i = 0; i < limit; i++) {
      const openTime = (now - secs * (limit - i)) * 1000;
      const open = price;
      const vol = 0.012;
      const drift = (r() - 0.5) * vol * price * 2;
      const close = Math.max(0.0001, open + drift);
      const high = Math.max(open, close) * (1 + r() * vol * 0.3);
      const low = Math.min(open, close) * (1 - r() * vol * 0.3);
      candles.push({
        instrumentId: `${symbol.toLowerCase()}.mock`,
        timeframe,
        openTime,
        open: Number(open.toFixed(4)),
        high: Number(high.toFixed(4)),
        low: Number(low.toFixed(4)),
        close: Number(close.toFixed(4)),
        volume: Math.round(500_000 * r())
      });
      price = close;
    }
    this.prices.set(symbol, price);
    return candles;
  }

  subscribe(
    symbol: string,
    timeframe: Timeframe,
    onCandle: (candle: Candle, isNewBar: boolean) => void
  ): () => void {
    const r = rng(hash(symbol) + 1);
    let current: Candle | null = null;
    const interval = setInterval(() => {
      const price = this.prices.get(symbol) ?? seedBasePrice(symbol);
      const vol = 0.01;
      const drift = (r() - 0.5) * vol * price;
      const next = Math.max(0.0001, price + drift);
      this.prices.set(symbol, next);
      const merged = mergeTickIntoCandle(current, next, 100, Date.now(), `${symbol.toLowerCase()}.mock`, timeframe);
      const isNew = !current || merged.openTime !== current.openTime;
      current = merged;
      onCandle(merged, isNew);
    }, 1500);
    return () => clearInterval(interval);
  }
}

const hash = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h) || 1;
};

const seedBasePrice = (symbol: string): number => {
  const map: Record<string, number> = {
    AAPL: 228.4,
    MSFT: 421.1,
    NVDA: 118.9,
    TSLA: 244.3,
    SPY: 568.7,
    "BTC-USD": 63500,
    "ETH-USD": 3280,
    "SOL-USD": 148.2,
    "EUR/USD": 1.0812,
    "GBP/USD": 1.2684
  };
  return map[symbol] ?? 100;
};

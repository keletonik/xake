import type {
  Candle,
  Instrument,
  MarketDataProvider,
  OrderBook,
  OrderBookLevel,
  Quote,
  Timeframe,
} from "./types";
import { timeframeSeconds } from "./types";

type CatalogueEntry = Instrument & { seed: number; vol: number };

const CATALOGUE: ReadonlyArray<CatalogueEntry> = [
  { symbol: "BTC-USD", displayName: "Bitcoin / USD", assetClass: "crypto", venue: "XAKE-CX", tickSize: 0.01, lotSize: 0.00001, quoteCurrency: "USD", marginFactor: 5, session: "24x7", seed: 96200, vol: 0.014 },
  { symbol: "ETH-USD", displayName: "Ethereum / USD", assetClass: "crypto", venue: "XAKE-CX", tickSize: 0.01, lotSize: 0.0001, quoteCurrency: "USD", marginFactor: 5, session: "24x7", seed: 3380, vol: 0.016 },
  { symbol: "SOL-USD", displayName: "Solana / USD", assetClass: "crypto", venue: "XAKE-CX", tickSize: 0.01, lotSize: 0.01, quoteCurrency: "USD", marginFactor: 5, session: "24x7", seed: 218, vol: 0.028 },
  { symbol: "XRP-USD", displayName: "XRP / USD", assetClass: "crypto", venue: "XAKE-CX", tickSize: 0.0001, lotSize: 1, quoteCurrency: "USD", marginFactor: 5, session: "24x7", seed: 2.41, vol: 0.030 },
  { symbol: "DOGE-USD", displayName: "Dogecoin / USD", assetClass: "crypto", venue: "XAKE-CX", tickSize: 0.00001, lotSize: 1, quoteCurrency: "USD", marginFactor: 3, session: "24x7", seed: 0.412, vol: 0.036 },
  { symbol: "ADA-USD", displayName: "Cardano / USD", assetClass: "crypto", venue: "XAKE-CX", tickSize: 0.0001, lotSize: 1, quoteCurrency: "USD", marginFactor: 3, session: "24x7", seed: 1.02, vol: 0.028 },
  { symbol: "AVAX-USD", displayName: "Avalanche / USD", assetClass: "crypto", venue: "XAKE-CX", tickSize: 0.01, lotSize: 0.01, quoteCurrency: "USD", marginFactor: 3, session: "24x7", seed: 41, vol: 0.031 },
  { symbol: "LINK-USD", displayName: "Chainlink / USD", assetClass: "crypto", venue: "XAKE-CX", tickSize: 0.001, lotSize: 0.1, quoteCurrency: "USD", marginFactor: 3, session: "24x7", seed: 19.8, vol: 0.028 },
  { symbol: "AAPL", displayName: "Apple Inc.", assetClass: "equity", venue: "NASDAQ", tickSize: 0.01, lotSize: 1, quoteCurrency: "USD", marginFactor: 2, session: "rth", seed: 247, vol: 0.009 },
  { symbol: "MSFT", displayName: "Microsoft Corp.", assetClass: "equity", venue: "NASDAQ", tickSize: 0.01, lotSize: 1, quoteCurrency: "USD", marginFactor: 2, session: "rth", seed: 438, vol: 0.008 },
  { symbol: "NVDA", displayName: "NVIDIA Corp.", assetClass: "equity", venue: "NASDAQ", tickSize: 0.01, lotSize: 1, quoteCurrency: "USD", marginFactor: 2, session: "rth", seed: 142, vol: 0.020 },
  { symbol: "TSLA", displayName: "Tesla Inc.", assetClass: "equity", venue: "NASDAQ", tickSize: 0.01, lotSize: 1, quoteCurrency: "USD", marginFactor: 2, session: "rth", seed: 412, vol: 0.024 },
  { symbol: "AMZN", displayName: "Amazon.com Inc.", assetClass: "equity", venue: "NASDAQ", tickSize: 0.01, lotSize: 1, quoteCurrency: "USD", marginFactor: 2, session: "rth", seed: 224, vol: 0.014 },
  { symbol: "META", displayName: "Meta Platforms", assetClass: "equity", venue: "NASDAQ", tickSize: 0.01, lotSize: 1, quoteCurrency: "USD", marginFactor: 2, session: "rth", seed: 615, vol: 0.016 },
  { symbol: "GOOGL", displayName: "Alphabet Class A", assetClass: "equity", venue: "NASDAQ", tickSize: 0.01, lotSize: 1, quoteCurrency: "USD", marginFactor: 2, session: "rth", seed: 194, vol: 0.012 },
  { symbol: "AMD", displayName: "Advanced Micro Devices", assetClass: "equity", venue: "NASDAQ", tickSize: 0.01, lotSize: 1, quoteCurrency: "USD", marginFactor: 2, session: "rth", seed: 137, vol: 0.020 },
  { symbol: "SPY", displayName: "SPDR S&P 500 ETF", assetClass: "index", venue: "ARCA", tickSize: 0.01, lotSize: 1, quoteCurrency: "USD", marginFactor: 4, session: "rth", seed: 612, vol: 0.007 },
  { symbol: "QQQ", displayName: "Invesco QQQ", assetClass: "index", venue: "ARCA", tickSize: 0.01, lotSize: 1, quoteCurrency: "USD", marginFactor: 4, session: "rth", seed: 524, vol: 0.010 },
  { symbol: "DIA", displayName: "SPDR Dow Jones ETF", assetClass: "index", venue: "ARCA", tickSize: 0.01, lotSize: 1, quoteCurrency: "USD", marginFactor: 4, session: "rth", seed: 450, vol: 0.006 },
  { symbol: "IWM", displayName: "iShares Russell 2000", assetClass: "index", venue: "ARCA", tickSize: 0.01, lotSize: 1, quoteCurrency: "USD", marginFactor: 4, session: "rth", seed: 244, vol: 0.009 },
  { symbol: "EUR-USD", displayName: "Euro / US Dollar", assetClass: "fx", venue: "FX", tickSize: 0.00001, lotSize: 1000, quoteCurrency: "USD", marginFactor: 30, session: "24x7", seed: 1.0782, vol: 0.003 },
  { symbol: "GBP-USD", displayName: "British Pound / US Dollar", assetClass: "fx", venue: "FX", tickSize: 0.00001, lotSize: 1000, quoteCurrency: "USD", marginFactor: 30, session: "24x7", seed: 1.2712, vol: 0.004 },
  { symbol: "USD-JPY", displayName: "US Dollar / Japanese Yen", assetClass: "fx", venue: "FX", tickSize: 0.001, lotSize: 1000, quoteCurrency: "JPY", marginFactor: 30, session: "24x7", seed: 156.4, vol: 0.004 },
  { symbol: "AUD-USD", displayName: "Australian Dollar / US Dollar", assetClass: "fx", venue: "FX", tickSize: 0.00001, lotSize: 1000, quoteCurrency: "USD", marginFactor: 30, session: "24x7", seed: 0.6542, vol: 0.004 },
  { symbol: "USD-CAD", displayName: "US Dollar / Canadian Dollar", assetClass: "fx", venue: "FX", tickSize: 0.00001, lotSize: 1000, quoteCurrency: "CAD", marginFactor: 30, session: "24x7", seed: 1.3912, vol: 0.003 },
  { symbol: "ES-M", displayName: "E-mini S&P 500 (Front)", assetClass: "future", venue: "CME", tickSize: 0.25, lotSize: 1, quoteCurrency: "USD", marginFactor: 20, session: "futures", seed: 6124, vol: 0.008 },
  { symbol: "NQ-M", displayName: "E-mini Nasdaq-100 (Front)", assetClass: "future", venue: "CME", tickSize: 0.25, lotSize: 1, quoteCurrency: "USD", marginFactor: 20, session: "futures", seed: 21420, vol: 0.011 },
  { symbol: "CL-M", displayName: "WTI Crude Oil (Front)", assetClass: "future", venue: "NYMEX", tickSize: 0.01, lotSize: 1, quoteCurrency: "USD", marginFactor: 15, session: "futures", seed: 71.42, vol: 0.018 },
  { symbol: "GC-M", displayName: "Gold (Front)", assetClass: "future", venue: "COMEX", tickSize: 0.10, lotSize: 1, quoteCurrency: "USD", marginFactor: 15, session: "futures", seed: 2712, vol: 0.010 },
  { symbol: "XAU-USD", displayName: "Gold Spot", assetClass: "commodity", venue: "OTC", tickSize: 0.01, lotSize: 0.01, quoteCurrency: "USD", marginFactor: 20, session: "24x7", seed: 2711, vol: 0.009 },
  { symbol: "XAG-USD", displayName: "Silver Spot", assetClass: "commodity", venue: "OTC", tickSize: 0.001, lotSize: 0.1, quoteCurrency: "USD", marginFactor: 20, session: "24x7", seed: 31.42, vol: 0.016 },
  { symbol: "WTI", displayName: "WTI Crude Spot", assetClass: "commodity", venue: "OTC", tickSize: 0.01, lotSize: 1, quoteCurrency: "USD", marginFactor: 15, session: "24x7", seed: 71.1, vol: 0.017 },
  { symbol: "AAPL-C250", displayName: "AAPL 250 Call (Weekly)", assetClass: "option", venue: "OPRA", tickSize: 0.01, lotSize: 1, quoteCurrency: "USD", marginFactor: 1, session: "rth", seed: 4.12, vol: 0.060 },
  { symbol: "SPY-P610", displayName: "SPY 610 Put (Weekly)", assetClass: "option", venue: "OPRA", tickSize: 0.01, lotSize: 1, quoteCurrency: "USD", marginFactor: 1, session: "rth", seed: 3.24, vol: 0.070 },
];

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function driftedPrice(seedPrice: number, vol: number, tMinutes: number, rand: () => number): number {
  const drift = Math.sin(tMinutes / 37) * 0.02 + (rand() - 0.5) * vol;
  const price = seedPrice * (1 + drift + Math.cos(tMinutes / 91) * 0.01);
  const low = seedPrice * 0.70;
  const high = seedPrice * 1.30;
  return Math.max(low, Math.min(high, price));
}

function round(value: number, tick: number): number {
  return Math.round(value / tick) * tick;
}

function hashSymbol(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 10_000;
}

export class MockMarketDataProvider implements MarketDataProvider {
  readonly name = "mock";
  readonly feedClass = "mock" as const;
  private subs = new Map<string, Set<(q: Quote) => void>>();
  private timer: ReturnType<typeof setInterval> | undefined;

  listInstruments(): Instrument[] {
    return CATALOGUE.map(({ seed: _seed, vol: _vol, ...rest }) => rest);
  }

  getQuote(symbol: string): Quote | undefined {
    const inst = CATALOGUE.find((i) => i.symbol === symbol);
    if (!inst) return undefined;
    const now = Date.now();
    const tMin = now / 60_000;
    const rand = mulberry32(Math.floor(tMin) + hashSymbol(symbol));
    const mid = driftedPrice(inst.seed, inst.vol, tMin, rand);
    const refMin = Math.floor(tMin) - 1440;
    const refRand = mulberry32(refMin + hashSymbol(symbol));
    const refPrice = driftedPrice(inst.seed, inst.vol, refMin, refRand);
    const halfSpread = Math.max(mid * 0.0003, inst.tickSize);
    const last = round(mid, inst.tickSize);
    return {
      symbol,
      bid: round(mid - halfSpread, inst.tickSize),
      ask: round(mid + halfSpread, inst.tickSize),
      last,
      ts: now,
      receivedAt: now,
      source: this.name,
      feedClass: this.feedClass,
      ageMs: 0,
      changeAbs: last - refPrice,
      changePct: ((last - refPrice) / refPrice) * 100,
      dayHigh: Math.max(last, refPrice) * (1 + inst.vol * 0.6),
      dayLow: Math.min(last, refPrice) * (1 - inst.vol * 0.6),
      dayVolume: Math.floor(rand() * 2_500_000),
    };
  }

  getCandles(symbol: string, tf: Timeframe, limit: number): Candle[] {
    const inst = CATALOGUE.find((i) => i.symbol === symbol);
    if (!inst) return [];
    const step = timeframeSeconds[tf] * 1000;
    const now = Date.now();
    const end = Math.floor(now / step) * step;
    const out: Candle[] = [];
    for (let i = limit - 1; i >= 0; i--) {
      const t = end - i * step;
      const rand = mulberry32(Math.floor(t / step) + hashSymbol(symbol));
      const open = driftedPrice(inst.seed, inst.vol, t / 60_000, rand);
      const close = driftedPrice(inst.seed, inst.vol, (t + step) / 60_000, rand);
      const high = Math.max(open, close) * (1 + rand() * inst.vol * 0.5);
      const low = Math.min(open, close) * (1 - rand() * inst.vol * 0.5);
      out.push({
        symbol,
        time: Math.floor(t / 1000),
        open: round(open, inst.tickSize),
        high: round(high, inst.tickSize),
        low: round(low, inst.tickSize),
        close: round(close, inst.tickSize),
        volume: Math.round(rand() * 5_000_000),
      });
    }
    return out;
  }

  getOrderBook(symbol: string, depth = 15): OrderBook | undefined {
    const inst = CATALOGUE.find((i) => i.symbol === symbol);
    const quote = this.getQuote(symbol);
    if (!inst || !quote) return undefined;
    const rand = mulberry32(Math.floor(Date.now() / 1000) + hashSymbol(symbol));
    const bids: OrderBookLevel[] = [];
    const asks: OrderBookLevel[] = [];
    const sizeBase = inst.assetClass === "fx" ? 25_000 : inst.assetClass === "crypto" ? 0.5 : 50;
    for (let i = 0; i < depth; i++) {
      const stepTicks = i + 1;
      const bidPrice = round(quote.bid - stepTicks * inst.tickSize, inst.tickSize);
      const askPrice = round(quote.ask + stepTicks * inst.tickSize, inst.tickSize);
      const shape = Math.exp(-i * 0.15);
      bids.push({
        price: bidPrice,
        size: round(sizeBase * (0.5 + rand()) * shape * (inst.assetClass === "crypto" ? 2 : 5), inst.assetClass === "crypto" ? 0.0001 : 1),
        orders: Math.max(1, Math.floor(rand() * 12)),
      });
      asks.push({
        price: askPrice,
        size: round(sizeBase * (0.5 + rand()) * shape * (inst.assetClass === "crypto" ? 2 : 5), inst.assetClass === "crypto" ? 0.0001 : 1),
        orders: Math.max(1, Math.floor(rand() * 12)),
      });
    }
    return {
      symbol,
      ts: Date.now(),
      bids,
      asks,
    };
  }

  subscribe(symbols: string[], onTick: (q: Quote) => void): () => void {
    for (const s of symbols) {
      if (!this.subs.has(s)) this.subs.set(s, new Set());
      this.subs.get(s)!.add(onTick);
    }
    this.ensureLoop();
    return () => {
      for (const s of symbols) this.subs.get(s)?.delete(onTick);
      if ([...this.subs.values()].every((v) => v.size === 0)) this.stopLoop();
    };
  }

  private ensureLoop() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      for (const [sym, handlers] of this.subs) {
        if (handlers.size === 0) continue;
        const q = this.getQuote(sym);
        if (!q) continue;
        for (const h of handlers) {
          try {
            h(q);
          } catch {
            // ignore bad subscriber
          }
        }
      }
    }, 1000);
  }

  private stopLoop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}

let singleton: MockMarketDataProvider | undefined;
export function getMarketProvider(): MarketDataProvider {
  if (!singleton) singleton = new MockMarketDataProvider();
  return singleton;
}

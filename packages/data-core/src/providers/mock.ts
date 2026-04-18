import { CATALOGUE, bySymbol } from "../instruments/catalogue";
import type {
  Candle,
  Instrument,
  ProviderHealth,
  Quote,
  Timeframe,
  Trade
} from "../types";
import { TIMEFRAME_SECONDS } from "../types";
import type { MarketDataProvider, Unsubscribe } from "./types";

/**
 * Deterministic mock provider for dev, tests, and UX demos. Generates
 * quotes using a seeded random walk and emits them on a fixed interval.
 * Use this everywhere until a licensed real-time provider is wired.
 */

const PROVIDER_NAME = "mock";

const seedRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = Math.imul(48271, s) % 0x7fffffff;
    return s / 0x7fffffff;
  };
};

export interface MockProviderOptions {
  readonly tickIntervalMs?: number;
  readonly seed?: number;
}

export class MockMarketDataProvider implements MarketDataProvider {
  readonly name = PROVIDER_NAME;
  readonly supportedAssetClasses = ["equity", "fx", "crypto", "index"] as const;

  private readonly rng: () => number;
  private readonly interval: number;
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private readonly prices = new Map<string, number>();
  private readonly subscribers = new Map<string, Set<(q: Quote) => void>>();
  private readonly tradeSubscribers = new Map<string, Set<(t: Trade) => void>>();
  private running = false;
  private reconnectCount = 0;
  private lastTickAt: number | undefined;
  private readonly boot = Date.now();

  constructor(opts: MockProviderOptions = {}) {
    this.rng = seedRandom(opts.seed ?? 1337);
    this.interval = opts.tickIntervalMs ?? 1500;
    for (const i of CATALOGUE) this.prices.set(i.symbol, i.basePrice);
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;
    this.tickTimer = setInterval(() => this.tick(), this.interval);
  }

  async stop(): Promise<void> {
    this.running = false;
    if (this.tickTimer) clearInterval(this.tickTimer);
    this.tickTimer = null;
  }

  health(): ProviderHealth {
    return {
      provider: PROVIDER_NAME,
      status: this.running ? "ok" : "down",
      lastTickAt: this.lastTickAt,
      reconnectCount: this.reconnectCount,
      checkedAt: Date.now()
    };
  }

  async listInstruments(query?: string): Promise<Instrument[]> {
    const q = query?.trim().toLowerCase() ?? "";
    const match = (i: Instrument) =>
      !q ||
      i.symbol.toLowerCase().includes(q) ||
      i.displayName.toLowerCase().includes(q);
    return CATALOGUE.filter(match).map(this.toInstrument);
  }

  async getInstrument(symbol: string): Promise<Instrument | null> {
    const seed = bySymbol(symbol);
    return seed ? this.toInstrument(seed) : null;
  }

  async getQuote(symbol: string): Promise<Quote | null> {
    const seed = bySymbol(symbol);
    if (!seed) return null;
    return this.buildQuote(seed, this.prices.get(seed.symbol) ?? seed.basePrice);
  }

  async getCandles(symbol: string, timeframe: Timeframe, limit: number): Promise<Candle[]> {
    const seed = bySymbol(symbol);
    if (!seed) return [];
    const secs = TIMEFRAME_SECONDS[timeframe];
    const now = Math.floor(Date.now() / 1000);
    const start = now - secs * limit;
    const candles: Candle[] = [];
    let price = seed.basePrice;
    for (let i = 0; i < limit; i++) {
      const openTime = (start + secs * i) * 1000;
      const open = price;
      const drift = (this.rng() - 0.5) * seed.volatility * price * 2;
      const close = Math.max(seed.tickSize, open + drift);
      const high = Math.max(open, close) * (1 + this.rng() * seed.volatility * 0.3);
      const low = Math.min(open, close) * (1 - this.rng() * seed.volatility * 0.3);
      candles.push({
        instrumentId: seed.id,
        timeframe,
        openTime,
        open: round(open, seed.tickSize),
        high: round(high, seed.tickSize),
        low: round(low, seed.tickSize),
        close: round(close, seed.tickSize),
        volume: Math.round(1_000_000 * this.rng())
      });
      price = close;
    }
    return candles;
  }

  subscribeQuotes(symbols: string[], onQuote: (q: Quote) => void): Unsubscribe {
    const targets = symbols.length ? symbols : CATALOGUE.map((i) => i.symbol);
    for (const s of targets) {
      let set = this.subscribers.get(s);
      if (!set) {
        set = new Set();
        this.subscribers.set(s, set);
      }
      set.add(onQuote);
    }
    return () => {
      for (const s of targets) this.subscribers.get(s)?.delete(onQuote);
    };
  }

  subscribeTrades(symbols: string[], onTrade: (t: Trade) => void): Unsubscribe {
    for (const s of symbols) {
      let set = this.tradeSubscribers.get(s);
      if (!set) {
        set = new Set();
        this.tradeSubscribers.set(s, set);
      }
      set.add(onTrade);
    }
    return () => {
      for (const s of symbols) this.tradeSubscribers.get(s)?.delete(onTrade);
    };
  }

  private tick(): void {
    const now = Date.now();
    for (const seed of CATALOGUE) {
      const prev = this.prices.get(seed.symbol) ?? seed.basePrice;
      const drift = (this.rng() - 0.5) * seed.volatility * prev;
      const next = Math.max(seed.tickSize, prev + drift);
      this.prices.set(seed.symbol, next);
      const quote = this.buildQuote(seed, next);
      this.subscribers.get(seed.symbol)?.forEach((cb) => cb(quote));
      const tradeSet = this.tradeSubscribers.get(seed.symbol);
      if (tradeSet?.size) {
        const t: Trade = {
          instrumentId: seed.id,
          price: round(next, seed.tickSize),
          size: Math.round(10 + this.rng() * 500),
          side: this.rng() > 0.5 ? "buy" : "sell",
          timestamp: now,
          attribution: {
            source: PROVIDER_NAME,
            feedClass: "mock",
            venue: seed.venue,
            ageMs: 0,
            receivedAt: now
          }
        };
        tradeSet.forEach((cb) => cb(t));
      }
    }
    this.lastTickAt = now;
  }

  private buildQuote(seed: (typeof CATALOGUE)[number], last: number): Quote {
    const now = Date.now();
    const spread = seed.tickSize * 2;
    const prev = seed.basePrice;
    return {
      instrumentId: seed.id,
      symbol: seed.symbol,
      bid: round(last - spread / 2, seed.tickSize),
      ask: round(last + spread / 2, seed.tickSize),
      last: round(last, seed.tickSize),
      change: round(last - prev, seed.tickSize),
      changePct: Number(((last - prev) / prev * 100).toFixed(4)),
      prevClose: prev,
      timestamp: now,
      attribution: {
        source: PROVIDER_NAME,
        feedClass: "mock",
        venue: seed.venue,
        ageMs: now - this.boot < 1000 ? 0 : 0,
        receivedAt: now
      }
    };
  }

  private toInstrument = (seed: (typeof CATALOGUE)[number]): Instrument => ({
    id: seed.id,
    symbol: seed.symbol,
    displayName: seed.displayName,
    assetClass: seed.assetClass,
    venue: seed.venue,
    currency: seed.currency,
    tickSize: seed.tickSize,
    lotSize: seed.lotSize,
    sessionStatus: seed.sessionStatus
  });
}

const round = (n: number, tick: number): number => {
  const decimals = Math.max(0, Math.round(-Math.log10(tick)));
  return Number(n.toFixed(decimals));
};

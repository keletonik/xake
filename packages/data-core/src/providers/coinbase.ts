import WebSocket from "ws";
import { CATALOGUE } from "../instruments/catalogue";
import type { ProviderHealth, Quote } from "../types";
import type { MarketDataProvider, Unsubscribe } from "./types";

/**
 * Public Coinbase Exchange market-data feed. No auth, no write scope —
 * market data only. This is a prototype real provider for the crypto
 * asset class. Licensing note: Coinbase's public WS is fine for
 * development; always verify the latest terms before shipping to
 * paying users, and respect their rate/connection limits.
 *
 * Only a subset of the mock provider surface is implemented here —
 * live quotes via subscribeQuotes. Historical candles fall back to the
 * mock provider so the chart workspace always has something to show.
 */

const WS_URL = "wss://ws-feed.exchange.coinbase.com";
const PROVIDER_NAME = "coinbase";

export class CoinbaseMarketDataProvider implements MarketDataProvider {
  readonly name = PROVIDER_NAME;
  readonly supportedAssetClasses = ["crypto"] as const;

  private ws: WebSocket | null = null;
  private readonly subscribers = new Map<string, Set<(q: Quote) => void>>();
  private reconnectCount = 0;
  private lastTickAt: number | undefined;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private stopping = false;

  async start(): Promise<void> {
    this.stopping = false;
    this.connect();
  }

  async stop(): Promise<void> {
    this.stopping = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }

  health(): ProviderHealth {
    const since = this.lastTickAt ? Date.now() - this.lastTickAt : undefined;
    const status = !this.ws ? "down" : since === undefined ? "unknown" : since > 10_000 ? "degraded" : "ok";
    return {
      provider: PROVIDER_NAME,
      status,
      lastTickAt: this.lastTickAt,
      reconnectCount: this.reconnectCount,
      checkedAt: Date.now()
    };
  }

  async listInstruments() {
    return CATALOGUE.filter((i) => i.venue === "COINBASE").map((i) => ({
      id: i.id,
      symbol: i.symbol,
      displayName: i.displayName,
      assetClass: i.assetClass,
      venue: i.venue,
      currency: i.currency,
      tickSize: i.tickSize,
      lotSize: i.lotSize,
      sessionStatus: i.sessionStatus
    }));
  }

  async getInstrument(symbol: string) {
    const list = await this.listInstruments();
    return list.find((i) => i.symbol.toLowerCase() === symbol.toLowerCase()) ?? null;
  }

  async getQuote(): Promise<Quote | null> {
    // Real provider: no synchronous snapshot. Consumers should subscribe.
    // Historical snapshot queries go through the mock provider fallback at the aggregator level.
    return null;
  }

  async getCandles(): Promise<never[]> {
    return [];
  }

  subscribeQuotes(symbols: string[], onQuote: (q: Quote) => void): Unsubscribe {
    for (const s of symbols) {
      let set = this.subscribers.get(s);
      if (!set) {
        set = new Set();
        this.subscribers.set(s, set);
      }
      set.add(onQuote);
    }
    this.resubscribe();
    return () => {
      for (const s of symbols) this.subscribers.get(s)?.delete(onQuote);
    };
  }

  private connect(): void {
    if (this.stopping) return;
    try {
      this.ws = new WebSocket(WS_URL);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.on("open", () => {
      this.reconnectCount = 0;
      this.resubscribe();
    });

    this.ws.on("message", (buf: WebSocket.RawData) => {
      try {
        const msg = JSON.parse(buf.toString());
        this.handleMessage(msg);
      } catch {
        // ignore malformed payloads
      }
    });

    this.ws.on("close", () => {
      this.scheduleReconnect();
    });

    this.ws.on("error", () => {
      this.ws?.close();
    });
  }

  private scheduleReconnect(): void {
    if (this.stopping) return;
    this.reconnectCount += 1;
    const delayMs = Math.min(30_000, 500 * 2 ** Math.min(6, this.reconnectCount));
    this.reconnectTimer = setTimeout(() => this.connect(), delayMs);
  }

  private resubscribe(): void {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    const productIds = Array.from(this.subscribers.keys());
    if (productIds.length === 0) return;
    this.ws.send(
      JSON.stringify({
        type: "subscribe",
        product_ids: productIds,
        channels: ["ticker"]
      })
    );
  }

  private handleMessage(msg: unknown): void {
    if (!isTickerMessage(msg)) return;
    const now = Date.now();
    const price = Number(msg.price);
    const bid = msg.best_bid ? Number(msg.best_bid) : undefined;
    const ask = msg.best_ask ? Number(msg.best_ask) : undefined;
    const change = msg.open_24h ? price - Number(msg.open_24h) : undefined;
    const changePct =
      msg.open_24h && Number(msg.open_24h) !== 0
        ? ((price - Number(msg.open_24h)) / Number(msg.open_24h)) * 100
        : undefined;
    const symbol = msg.product_id;
    const quote: Quote = {
      instrumentId: `cr.${symbol.replace("-", "").toLowerCase()}`,
      symbol,
      bid,
      ask,
      last: price,
      change,
      changePct: changePct === undefined ? undefined : Number(changePct.toFixed(4)),
      open: msg.open_24h ? Number(msg.open_24h) : undefined,
      high: msg.high_24h ? Number(msg.high_24h) : undefined,
      low: msg.low_24h ? Number(msg.low_24h) : undefined,
      volume: msg.volume_24h ? Number(msg.volume_24h) : undefined,
      timestamp: msg.time ? Date.parse(msg.time) : now,
      attribution: {
        source: PROVIDER_NAME,
        feedClass: "realtime",
        venue: "COINBASE",
        ageMs: msg.time ? Math.max(0, now - Date.parse(msg.time)) : 0,
        receivedAt: now
      }
    };
    this.lastTickAt = now;
    this.subscribers.get(symbol)?.forEach((cb) => cb(quote));
  }
}

interface TickerMessage {
  type: "ticker";
  product_id: string;
  price: string;
  time?: string;
  best_bid?: string;
  best_ask?: string;
  open_24h?: string;
  high_24h?: string;
  low_24h?: string;
  volume_24h?: string;
}

const isTickerMessage = (msg: unknown): msg is TickerMessage => {
  if (!msg || typeof msg !== "object") return false;
  const m = msg as Record<string, unknown>;
  return m.type === "ticker" && typeof m.product_id === "string" && typeof m.price === "string";
};

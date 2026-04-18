/**
 * Provider interfaces. Every data provider, news source, macro feed, and
 * execution venue implements one of these. UI code never imports from
 * providers directly — it consumes the normalised types and subscribes
 * through the API stream gateway.
 */

import type {
  Candle,
  Instrument,
  MacroEvent,
  NewsItem,
  ProviderHealth,
  Quote,
  Timeframe,
  Trade
} from "../types";

export type Unsubscribe = () => void;

export interface MarketDataProvider {
  readonly name: string;
  readonly supportedAssetClasses: ReadonlyArray<Instrument["assetClass"]>;

  start(): Promise<void>;
  stop(): Promise<void>;
  health(): ProviderHealth;

  listInstruments(query?: string): Promise<Instrument[]>;
  getInstrument(symbol: string): Promise<Instrument | null>;
  getQuote(symbol: string): Promise<Quote | null>;
  getCandles(symbol: string, timeframe: Timeframe, limit: number): Promise<Candle[]>;

  subscribeQuotes(symbols: string[], onQuote: (q: Quote) => void): Unsubscribe;
  subscribeTrades?(symbols: string[], onTrade: (t: Trade) => void): Unsubscribe;
}

export interface NewsProvider {
  readonly name: string;
  list(filter?: { symbols?: string[]; limit?: number }): Promise<NewsItem[]>;
  subscribe?(symbols: string[], onItem: (n: NewsItem) => void): Unsubscribe;
}

export interface MacroCalendarProvider {
  readonly name: string;
  upcoming(filter?: { fromMs: number; toMs: number; country?: string }): Promise<MacroEvent[]>;
}

/**
 * ExecutionVenue is a reserved interface. Implementation is gated on
 * licensing and regulatory posture — this repo only ships the contract
 * and the paper engine. See docs/engineering/security-boundaries.md.
 */
export interface ExecutionVenue {
  readonly name: string;
  readonly supportedEnv: ReadonlyArray<"paper" | "live">;
}

export interface PortfolioSource {
  readonly name: string;
  readonly env: "paper" | "live";
}

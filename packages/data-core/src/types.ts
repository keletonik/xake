/**
 * Canonical market-data models. Every provider normalises to these types
 * before anything downstream consumes them. No provider-specific fields leak.
 */

import { z } from "zod";

export type AssetClass = "equity" | "fx" | "crypto" | "futures" | "index";
export type FeedClass = "realtime" | "delayed" | "indicative" | "mock";
export type ProviderHealthStatus = "ok" | "degraded" | "down" | "unknown";
export type SessionStatus = "pre" | "regular" | "post" | "closed" | "24x7";

export const InstrumentSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  displayName: z.string(),
  assetClass: z.enum(["equity", "fx", "crypto", "futures", "index"]),
  venue: z.string(),
  currency: z.string().length(3),
  tickSize: z.number().positive(),
  lotSize: z.number().positive().default(1),
  sessionStatus: z.enum(["pre", "regular", "post", "closed", "24x7"]).default("regular")
});
export type Instrument = z.infer<typeof InstrumentSchema>;

export interface ProviderAttribution {
  readonly source: string;
  readonly feedClass: FeedClass;
  readonly venue?: string;
  readonly ageMs: number;
  readonly receivedAt: number;
}

export interface Quote {
  readonly instrumentId: string;
  readonly symbol: string;
  readonly bid?: number;
  readonly ask?: number;
  readonly last: number;
  readonly change?: number;
  readonly changePct?: number;
  readonly open?: number;
  readonly high?: number;
  readonly low?: number;
  readonly prevClose?: number;
  readonly volume?: number;
  readonly timestamp: number;
  readonly attribution: ProviderAttribution;
}

export interface Trade {
  readonly instrumentId: string;
  readonly price: number;
  readonly size: number;
  readonly side?: "buy" | "sell";
  readonly timestamp: number;
  readonly attribution: ProviderAttribution;
}

export interface Candle {
  readonly instrumentId: string;
  readonly timeframe: Timeframe;
  readonly openTime: number;
  readonly open: number;
  readonly high: number;
  readonly low: number;
  readonly close: number;
  readonly volume: number;
}

export type Timeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1d" | "1w";

export const TIMEFRAME_SECONDS: Record<Timeframe, number> = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "1h": 3600,
  "4h": 14400,
  "1d": 86400,
  "1w": 604800
};

export interface OrderBookLevel {
  readonly price: number;
  readonly size: number;
  readonly orders?: number;
}

export interface OrderBookSnapshot {
  readonly instrumentId: string;
  readonly bids: OrderBookLevel[];
  readonly asks: OrderBookLevel[];
  readonly timestamp: number;
  readonly attribution: ProviderAttribution;
}

export interface NewsItem {
  readonly id: string;
  readonly headline: string;
  readonly summary?: string;
  readonly url?: string;
  readonly publisher: string;
  readonly publishedAt: number;
  readonly symbols: string[];
  readonly sentiment?: "positive" | "neutral" | "negative";
  readonly attribution: ProviderAttribution;
}

export interface MacroEvent {
  readonly id: string;
  readonly title: string;
  readonly country: string;
  readonly importance: "low" | "medium" | "high";
  readonly scheduledAt: number;
  readonly actual?: number | string;
  readonly forecast?: number | string;
  readonly previous?: number | string;
  readonly attribution: ProviderAttribution;
}

export interface ProviderHealth {
  readonly provider: string;
  readonly status: ProviderHealthStatus;
  readonly lastTickAt?: number;
  readonly reconnectCount: number;
  readonly message?: string;
  readonly checkedAt: number;
}

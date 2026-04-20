import { z } from "zod";

export const AssetClassEnum = z.enum([
  "crypto",
  "equity",
  "fx",
  "future",
  "index",
  "commodity",
  "option",
]);
export type AssetClass = z.infer<typeof AssetClassEnum>;

export const InstrumentSchema = z.object({
  symbol: z.string().min(1),
  displayName: z.string(),
  assetClass: AssetClassEnum,
  venue: z.string(),
  tickSize: z.number().positive(),
  lotSize: z.number().positive().default(1),
  quoteCurrency: z.string().default("USD"),
  marginFactor: z.number().positive().default(1),
  session: z.enum(["24x7", "rth", "futures"]).default("24x7"),
});
export type Instrument = z.infer<typeof InstrumentSchema>;

export const QuoteSchema = z.object({
  symbol: z.string(),
  bid: z.number(),
  ask: z.number(),
  last: z.number(),
  ts: z.number(),
  receivedAt: z.number(),
  source: z.string(),
  feedClass: z.enum(["mock", "delayed", "realtime"]),
  ageMs: z.number().nonnegative(),
  changeAbs: z.number().default(0),
  changePct: z.number().default(0),
  dayHigh: z.number().optional(),
  dayLow: z.number().optional(),
  dayVolume: z.number().nonnegative().default(0),
});
export type Quote = z.infer<typeof QuoteSchema>;

export const CandleSchema = z.object({
  symbol: z.string(),
  time: z.number(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number().nonnegative(),
});
export type Candle = z.infer<typeof CandleSchema>;

export const OrderBookLevelSchema = z.object({
  price: z.number(),
  size: z.number().nonnegative(),
  orders: z.number().int().nonnegative().default(1),
});
export type OrderBookLevel = z.infer<typeof OrderBookLevelSchema>;

export const OrderBookSchema = z.object({
  symbol: z.string(),
  ts: z.number(),
  bids: z.array(OrderBookLevelSchema),
  asks: z.array(OrderBookLevelSchema),
});
export type OrderBook = z.infer<typeof OrderBookSchema>;

export type Timeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1d" | "1w";

export const timeframeSeconds: Record<Timeframe, number> = {
  "1m": 60,
  "5m": 5 * 60,
  "15m": 15 * 60,
  "1h": 60 * 60,
  "4h": 4 * 60 * 60,
  "1d": 24 * 60 * 60,
  "1w": 7 * 24 * 60 * 60,
};

export interface MarketDataProvider {
  readonly name: string;
  readonly feedClass: Quote["feedClass"];
  listInstruments(): Instrument[];
  getQuote(symbol: string): Quote | undefined;
  getCandles(symbol: string, tf: Timeframe, limit: number): Candle[];
  getOrderBook(symbol: string, depth: number): OrderBook | undefined;
  subscribe(symbols: string[], onTick: (q: Quote) => void): () => void;
}

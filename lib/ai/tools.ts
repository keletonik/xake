import { z } from "zod";
import { getMarketProvider } from "@/lib/data-core/mock-provider";
import { ema, rsi, sma } from "@/lib/indicators";
import { store } from "@/lib/store/memory";

export type Tool = {
  name: string;
  description: string;
  input: z.ZodTypeAny;
  run: (args: unknown, accountId: string) => Promise<unknown>;
};

export const tools: Tool[] = [
  {
    name: "get_quote",
    description: "Fetch the latest quote (bid, ask, last, 24h change) for a symbol.",
    input: z.object({ symbol: z.string() }),
    run: async (args) => {
      const { symbol } = z.object({ symbol: z.string() }).parse(args);
      const q = getMarketProvider().getQuote(symbol);
      if (!q) return { ok: false, error: `Unknown symbol ${symbol}` };
      return { ok: true, quote: q };
    },
  },
  {
    name: "get_orderbook",
    description: "Fetch the level-2 orderbook for a symbol (bids and asks, price + size).",
    input: z.object({ symbol: z.string(), depth: z.number().int().positive().max(30).default(10) }),
    run: async (args) => {
      const { symbol, depth } = z
        .object({ symbol: z.string(), depth: z.number().int().positive().max(30).default(10) })
        .parse(args);
      const book = getMarketProvider().getOrderBook(symbol, depth);
      if (!book) return { ok: false, error: `Unknown symbol ${symbol}` };
      return { ok: true, book };
    },
  },
  {
    name: "get_indicators",
    description:
      "Compute SMA/EMA/RSI on the last N closes for a symbol at a given timeframe. Good for trend reads.",
    input: z.object({
      symbol: z.string(),
      timeframe: z.enum(["1m", "5m", "15m", "1h", "4h", "1d", "1w"]).default("1h"),
      periods: z.number().int().positive().max(500).default(200),
    }),
    run: async (args) => {
      const { symbol, timeframe, periods } = z
        .object({
          symbol: z.string(),
          timeframe: z.enum(["1m", "5m", "15m", "1h", "4h", "1d", "1w"]).default("1h"),
          periods: z.number().int().positive().max(500).default(200),
        })
        .parse(args);
      const candles = getMarketProvider().getCandles(symbol, timeframe, periods);
      if (candles.length === 0) return { ok: false, error: `No candles for ${symbol}` };
      const closes = candles.map((c) => c.close);
      const sma20 = sma(closes, 20);
      const sma50 = sma(closes, 50);
      const ema20 = ema(closes, 20);
      const rsi14 = rsi(closes, 14);
      const tail = <T,>(arr: T[]) => arr[arr.length - 1];
      return {
        ok: true,
        symbol,
        timeframe,
        last: tail(closes),
        sma20: tail(sma20),
        sma50: tail(sma50),
        ema20: tail(ema20),
        rsi14: tail(rsi14),
      };
    },
  },
  {
    name: "screen_instruments",
    description:
      "Screen across the catalogue. Filter by asset class and optional min last price. Sorts by 24h change descending. Returns up to 25.",
    input: z.object({
      assetClass: z
        .enum(["crypto", "equity", "fx", "future", "index", "commodity", "option"])
        .optional(),
      minLast: z.number().optional(),
      onlyGainers: z.boolean().optional(),
    }),
    run: async (args) => {
      const parsed = z
        .object({
          assetClass: z
            .enum(["crypto", "equity", "fx", "future", "index", "commodity", "option"])
            .optional(),
          minLast: z.number().optional(),
          onlyGainers: z.boolean().optional(),
        })
        .parse(args);
      const p = getMarketProvider();
      const rows = p
        .listInstruments()
        .filter((i) => (parsed.assetClass ? i.assetClass === parsed.assetClass : true))
        .map((i) => ({ instrument: i, quote: p.getQuote(i.symbol) }))
        .filter((r) => (parsed.minLast === undefined ? true : (r.quote?.last ?? 0) >= parsed.minLast))
        .filter((r) => (parsed.onlyGainers ? (r.quote?.changePct ?? 0) > 0 : true))
        .sort((a, b) => (b.quote?.changePct ?? 0) - (a.quote?.changePct ?? 0))
        .slice(0, 25);
      return { ok: true, rows };
    },
  },
  {
    name: "list_watchlist",
    description: "List symbols in the user's primary watchlist with their latest quotes.",
    input: z.object({}),
    run: async (_args, accountId) => {
      const wl = store.ensureWatchlist(accountId);
      const provider = getMarketProvider();
      return {
        ok: true,
        watchlist: wl,
        quotes: wl.symbols.map((s) => provider.getQuote(s)).filter(Boolean),
      };
    },
  },
  {
    name: "portfolio_summary",
    description: "Summarise the user's paper portfolio: cash, positions, realised and unrealised P&L.",
    input: z.object({}),
    run: async (_args, accountId) => {
      const state = store.ensurePaper(accountId);
      const provider = getMarketProvider();
      const positions = [...state.positions.values()].map((p) => {
        const q = provider.getQuote(p.symbol);
        const mark = q?.last ?? p.avgCost;
        return {
          ...p,
          last: mark,
          unrealised: (mark - p.avgCost) * p.qty,
          unrealisedPct: p.avgCost ? ((mark - p.avgCost) / p.avgCost) * 100 : 0,
        };
      });
      const unrealisedTotal = positions.reduce((acc, p) => acc + p.unrealised, 0);
      const positionsValue = positions.reduce((acc, p) => acc + p.last * p.qty, 0);
      return {
        ok: true,
        summary: {
          cash: state.cash,
          equity: state.cash + positionsValue,
          realisedPnl: state.realisedPnl,
          unrealisedPnl: unrealisedTotal,
          positions,
        },
      };
    },
  },
  {
    name: "draft_order",
    description:
      "Draft a paper order. This does NOT place it — the user must confirm in the UI. Always include a short rationale.",
    input: z.object({
      symbol: z.string(),
      side: z.enum(["buy", "sell"]),
      type: z.enum(["market", "limit"]),
      qty: z.number().positive(),
      limitPrice: z.number().positive().optional(),
      stopPrice: z.number().positive().optional(),
      rationale: z.string().min(1).max(400),
    }),
    run: async (args) => ({ ok: true, draft: args }),
  },
  {
    name: "draft_alert",
    description:
      "Draft an alert. This does NOT create it — the user must confirm in the UI. Include a short rationale.",
    input: z.object({
      name: z.string().min(1).max(80),
      symbol: z.string(),
      op: z.enum(["gt", "lt"]),
      value: z.number(),
      rationale: z.string().min(1).max(400),
    }),
    run: async (args) => ({ ok: true, draft: args }),
  },
];

export type ToolName = (typeof tools)[number]["name"];

export function anthropicToolDefs() {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: zodToJsonSchema(t.input),
  }));
}

function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, z.ZodTypeAny>;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    for (const [key, value] of Object.entries(shape)) {
      properties[key] = describe(value);
      if (!value.isOptional()) required.push(key);
    }
    return { type: "object", properties, required };
  }
  return { type: "object" };
}

function describe(schema: z.ZodTypeAny): Record<string, unknown> {
  let s = schema;
  while (s instanceof z.ZodOptional || s instanceof z.ZodDefault) {
    s = s._def.innerType;
  }
  if (s instanceof z.ZodString) return { type: "string" };
  if (s instanceof z.ZodNumber) return { type: "number" };
  if (s instanceof z.ZodBoolean) return { type: "boolean" };
  if (s instanceof z.ZodEnum) return { type: "string", enum: s.options };
  if (s instanceof z.ZodArray) return { type: "array", items: describe(s.element) };
  return { type: "string" };
}

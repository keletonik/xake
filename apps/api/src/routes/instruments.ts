import { Hono } from "hono";
import { MockMarketDataProvider, type Timeframe } from "@xake/data-core";

const mock = new MockMarketDataProvider({ tickIntervalMs: 2000 });
await mock.start();

export const instrumentsRoutes = new Hono();

instrumentsRoutes.get("/v1/instruments", async (c) => {
  const query = c.req.query("q") ?? undefined;
  const assetClass = c.req.query("asset_class") ?? undefined;
  let list = await mock.listInstruments(query);
  if (assetClass) list = list.filter((i) => i.assetClass === assetClass);
  return c.json({ items: list });
});

instrumentsRoutes.get("/v1/instruments/:symbol", async (c) => {
  const sym = c.req.param("symbol");
  const i = await mock.getInstrument(sym);
  if (!i) return c.json({ error: "NOT_FOUND" }, 404);
  const q = await mock.getQuote(sym);
  return c.json({ instrument: i, quote: q });
});

instrumentsRoutes.get("/v1/instruments/:symbol/candles", async (c) => {
  const sym = c.req.param("symbol");
  const tf = (c.req.query("tf") ?? "1h") as Timeframe;
  const limit = Number(c.req.query("limit") ?? 300);
  const candles = await mock.getCandles(sym, tf, Math.min(1000, Math.max(10, limit)));
  return c.json({ symbol: sym, timeframe: tf, candles, source: mock.name });
});

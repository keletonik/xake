import { Hono } from "hono";
import { store } from "../lib/store.js";
import { currentAccountId } from "../lib/current-account.js";

export const portfolioRoutes = new Hono();

portfolioRoutes.get("/v1/portfolio", (c) => c.json(store.getPortfolio(currentAccountId(c))));

portfolioRoutes.get("/v1/portfolio/activity", (c) => {
  const id = currentAccountId(c);
  return c.json({ orders: store.listOrders(id), fills: store.listFills(id) });
});

portfolioRoutes.post("/v1/portfolio/reset", (c) => {
  const id = currentAccountId(c);
  store.resetPaperBalance(id);
  return c.json({ ok: true, portfolio: store.getPortfolio(id) });
});

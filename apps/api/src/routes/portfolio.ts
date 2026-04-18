import { Hono } from "hono";
import { env } from "../env.js";
import { store } from "../lib/store.js";

export const portfolioRoutes = new Hono();
const account = () => env.DEMO_ACCOUNT_ID;

portfolioRoutes.get("/v1/portfolio", (c) => c.json(store.getPortfolio(account())));

portfolioRoutes.get("/v1/portfolio/activity", (c) =>
  c.json({
    orders: store.listOrders(account()),
    fills: store.listFills(account())
  })
);

portfolioRoutes.post("/v1/portfolio/reset", (c) => {
  store.resetPaperBalance(account());
  return c.json({ ok: true, portfolio: store.getPortfolio(account()) });
});

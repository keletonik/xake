import { Hono } from "hono";
import { OrderDraftSchema } from "@xake/trading-core";
import { env } from "../env.js";
import { store } from "../lib/store.js";

export const ordersRoutes = new Hono();
const account = () => env.DEMO_ACCOUNT_ID;

ordersRoutes.get("/v1/orders", (c) => c.json({ items: store.listOrders(account()) }));

ordersRoutes.post("/v1/orders", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = OrderDraftSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.issues }, 400);
  // Hard constraint: live execution is not enabled in this repo.
  if (parsed.data.env !== "paper") return c.json({ error: "LIVE_DISABLED" }, 403);
  const r = store.submitOrder(account(), parsed.data);
  if ("error" in r) return c.json(r, 400);
  return c.json(r);
});

ordersRoutes.delete("/v1/orders/:id", (c) => {
  const r = store.cancelOrder(account(), c.req.param("id"));
  if ("error" in r) return c.json(r, 404);
  return c.json({ order: r });
});

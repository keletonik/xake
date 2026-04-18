import { Hono } from "hono";
import { OrderDraftSchema } from "@xake/trading-core";
import { store } from "../lib/store.js";
import { currentAccountId } from "../lib/current-account.js";

export const ordersRoutes = new Hono();

ordersRoutes.get("/v1/orders", (c) => c.json({ items: store.listOrders(currentAccountId(c)) }));

ordersRoutes.post("/v1/orders", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = OrderDraftSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.issues }, 400);
  if (parsed.data.env !== "paper") return c.json({ error: "LIVE_DISABLED" }, 403);
  const r = store.submitOrder(currentAccountId(c), parsed.data);
  if ("error" in r) return c.json(r, 400);
  return c.json(r);
});

ordersRoutes.delete("/v1/orders/:id", (c) => {
  const r = store.cancelOrder(currentAccountId(c), c.req.param("id"));
  if ("error" in r) return c.json(r, 404);
  return c.json({ order: r });
});

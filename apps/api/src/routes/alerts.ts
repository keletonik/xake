import { Hono } from "hono";
import { AlertDraftSchema } from "@xake/trading-core";
import { env } from "../env.js";
import { store } from "../lib/store.js";

export const alertsRoutes = new Hono();
const account = () => env.DEMO_ACCOUNT_ID;

alertsRoutes.get("/v1/alerts", (c) => c.json({ items: store.listAlerts(account()) }));

alertsRoutes.get("/v1/alerts/history", (c) => c.json({ items: store.listAlertEvents(account()) }));

alertsRoutes.post("/v1/alerts", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = AlertDraftSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.issues }, 400);
  const r = store.createAlert(account(), parsed.data);
  if ("error" in r) return c.json(r, 409);
  return c.json({ alert: r });
});

alertsRoutes.patch("/v1/alerts/:id", async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { active?: boolean };
  if (typeof body.active !== "boolean") return c.json({ error: "active boolean required" }, 400);
  const r = store.toggleAlert(account(), c.req.param("id"), body.active);
  if ("error" in r) return c.json(r, 404);
  return c.json({ alert: r });
});

alertsRoutes.delete("/v1/alerts/:id", (c) => {
  const r = store.deleteAlert(account(), c.req.param("id"));
  if ("error" in r) return c.json(r, 404);
  return c.json(r);
});

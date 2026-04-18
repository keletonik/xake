import { Hono } from "hono";
import { AlertDraftSchema } from "@xake/trading-core";
import { store } from "../lib/store.js";
import { currentAccountId } from "../lib/current-account.js";

export const alertsRoutes = new Hono();

alertsRoutes.get("/v1/alerts", (c) => c.json({ items: store.listAlerts(currentAccountId(c)) }));

alertsRoutes.get("/v1/alerts/history", (c) => c.json({ items: store.listAlertEvents(currentAccountId(c)) }));

alertsRoutes.post("/v1/alerts", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = AlertDraftSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.issues }, 400);
  const r = store.createAlert(currentAccountId(c), parsed.data);
  if ("error" in r) return c.json(r, 409);
  return c.json({ alert: r });
});

alertsRoutes.patch("/v1/alerts/:id", async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { active?: boolean };
  if (typeof body.active !== "boolean") return c.json({ error: "active boolean required" }, 400);
  const r = store.toggleAlert(currentAccountId(c), c.req.param("id"), body.active);
  if ("error" in r) return c.json(r, 404);
  return c.json({ alert: r });
});

alertsRoutes.delete("/v1/alerts/:id", (c) => {
  const r = store.deleteAlert(currentAccountId(c), c.req.param("id"));
  if ("error" in r) return c.json(r, 404);
  return c.json(r);
});

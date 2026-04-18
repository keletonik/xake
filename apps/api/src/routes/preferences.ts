import { Hono } from "hono";
import { z } from "zod";
import { store } from "../lib/store.js";
import { currentAccountId } from "../lib/current-account.js";

/**
 * Per-user preferences. Persists what the user has configured in
 * /app/settings. On Vercel these are DB-backed; without a DB, the
 * in-memory store is used (documented in what-is-mocked).
 */

export const preferencesRoutes = new Hono();

const PreferenceSchema = z.object({
  theme: z.enum(["dark", "darker", "light", "system"]).optional(),
  timezone: z.string().max(64).optional(),
  defaultSymbol: z.string().max(32).optional(),
  defaultTimeframe: z.string().max(8).optional(),
  defaultWatchlistId: z.string().optional(),
  aiEnabled: z.boolean().optional(),
  aiPremiumReasoning: z.boolean().optional(),
  notificationsInApp: z.boolean().optional(),
  notificationsEmail: z.boolean().optional(),
  notificationsWebhook: z.string().url().optional().or(z.literal("")),
  paperStartingCash: z.number().positive().max(10_000_000).optional()
});

preferencesRoutes.get("/v1/preferences", (c) => {
  const p = store.getPreferences(currentAccountId(c));
  return c.json({ preferences: p });
});

preferencesRoutes.patch("/v1/preferences", async (c) => {
  const parsed = PreferenceSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!parsed.success) return c.json({ error: parsed.error.issues }, 400);
  const updated = store.updatePreferences(currentAccountId(c), parsed.data);
  return c.json({ preferences: updated });
});

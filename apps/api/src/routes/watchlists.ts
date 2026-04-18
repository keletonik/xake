import { Hono } from "hono";
import { z } from "zod";
import { store } from "../lib/store.js";
import { currentAccountId } from "../lib/current-account.js";

export const watchlistsRoutes = new Hono();

watchlistsRoutes.get("/v1/watchlists", (c) => c.json({ items: store.listWatchlists(currentAccountId(c)) }));

const CreateBody = z.object({ name: z.string().min(1).max(120), description: z.string().max(500).optional() });
watchlistsRoutes.post("/v1/watchlists", async (c) => {
  const body = CreateBody.safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues }, 400);
  return c.json({ watchlist: store.createWatchlist(currentAccountId(c), body.data.name, body.data.description) });
});

const UpdateBody = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional()
});
watchlistsRoutes.patch("/v1/watchlists/:id", async (c) => {
  const body = UpdateBody.safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues }, 400);
  const r = store.updateWatchlist(currentAccountId(c), c.req.param("id"), body.data);
  if ("error" in r) return c.json(r, 404);
  return c.json({ watchlist: r });
});

watchlistsRoutes.delete("/v1/watchlists/:id", (c) => {
  const r = store.deleteWatchlist(currentAccountId(c), c.req.param("id"));
  if ("error" in r) return c.json(r, 404);
  return c.json(r);
});

const ItemBody = z.object({
  symbol: z.string().min(1),
  tags: z.array(z.string()).default([]),
  note: z.string().max(500).optional(),
  pinned: z.boolean().default(false)
});
watchlistsRoutes.post("/v1/watchlists/:id/items", async (c) => {
  const body = ItemBody.safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues }, 400);
  const r = store.addWatchlistItem(currentAccountId(c), c.req.param("id"), {
    symbol: body.data.symbol,
    addedAt: Date.now(),
    tags: body.data.tags,
    note: body.data.note,
    pinned: body.data.pinned
  });
  if ("error" in r) return c.json(r, 404);
  return c.json({ watchlist: r });
});

watchlistsRoutes.delete("/v1/watchlists/:id/items/:symbol", (c) => {
  const r = store.removeWatchlistItem(currentAccountId(c), c.req.param("id"), c.req.param("symbol"));
  if ("error" in r) return c.json(r, 404);
  return c.json({ watchlist: r });
});

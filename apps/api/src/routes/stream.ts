import { Hono } from "hono";
import { streamManager } from "../services/stream-manager.js";
import { openSse } from "../lib/sse.js";

export const streamRoutes = new Hono();

streamRoutes.get("/v1/stream/quotes", async (c) => {
  const symbols = (c.req.query("symbols") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return openSse(c, async (e) => {
    const unsub = streamManager.subscribe(symbols, (quote) => {
      void e.send("quote", quote);
    });
    await e.send("hello", {
      subscribedTo: symbols.length ? symbols : "all",
      providers: streamManager.health()
    });
    // Keep the connection open until the client aborts.
    await new Promise<void>(() => undefined).finally(unsub);
  });
});

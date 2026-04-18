import { Hono } from "hono";
import { z } from "zod";
import { openSse } from "../lib/sse.js";
import { runAssistant, type AssistantMessage } from "../services/ai-service.js";

export const assistantRoutes = new Hono();

const RequestBody = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(32_000)
      })
    )
    .min(1),
  context: z
    .object({
      activeSymbol: z.string().optional(),
      activeTimeframe: z.string().optional(),
      selectedWatchlistId: z.string().optional(),
      selectedWatchlistName: z.string().optional(),
      watchlistSymbols: z.array(z.string()).optional(),
      timezone: z.string().optional()
    })
    .optional()
    .default({})
});

assistantRoutes.post("/v1/assistant/stream", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = RequestBody.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.issues }, 400);

  return openSse(c, async (e) => {
    try {
      for await (const evt of runAssistant({
        messages: parsed.data.messages as AssistantMessage[],
        context: {
          ...parsed.data.context,
          nowIso: new Date().toISOString()
        }
      })) {
        await e.send(evt.kind, evt);
        if (evt.kind === "stop") break;
      }
    } catch (err) {
      await e.send("error", {
        kind: "error",
        message: err instanceof Error ? err.message : "unknown"
      });
    }
  });
});

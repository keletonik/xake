import { z } from "zod";
import { AlertDraftSchema, OrderDraftSchema, WatchlistItemSchema } from "@xake/trading-core";

/**
 * Structured outputs for the assistant. Every action the assistant
 * proposes must conform to one of these schemas. The API validates
 * payloads before letting them cross a safety boundary.
 */

export const WatchlistDraftSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  theme: z.string().max(120).optional(),
  items: z.array(WatchlistItemSchema).min(1).max(50)
});
export type WatchlistDraft = z.infer<typeof WatchlistDraftSchema>;

export const MarketSummarySchema = z.object({
  symbol: z.string(),
  timeframe: z.string(),
  narrative: z.string().min(20).max(2000),
  bullishPoints: z.array(z.string()).default([]),
  bearishPoints: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  confidence: z.enum(["low", "medium", "high"]).default("medium"),
  sources: z.array(z.string()).default([])
});
export type MarketSummary = z.infer<typeof MarketSummarySchema>;

export const NewsSummarySchema = z.object({
  symbols: z.array(z.string()),
  lookbackHours: z.number().int().positive(),
  takeaway: z.string().min(10).max(1500),
  items: z.array(
    z.object({
      headline: z.string(),
      publisher: z.string().optional(),
      importance: z.enum(["low", "medium", "high"]).default("medium"),
      summary: z.string().max(500)
    })
  )
});
export type NewsSummary = z.infer<typeof NewsSummarySchema>;

export const AssistantActionEnvelope = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("watchlist_draft"), payload: WatchlistDraftSchema }),
  z.object({ kind: z.literal("alert_draft"), payload: AlertDraftSchema }),
  z.object({ kind: z.literal("order_draft"), payload: OrderDraftSchema }),
  z.object({ kind: z.literal("market_summary"), payload: MarketSummarySchema }),
  z.object({ kind: z.literal("news_summary"), payload: NewsSummarySchema })
]);
export type AssistantAction = z.infer<typeof AssistantActionEnvelope>;

export const validateAction = (input: unknown): AssistantAction | null => {
  const parsed = AssistantActionEnvelope.safeParse(input);
  return parsed.success ? parsed.data : null;
};

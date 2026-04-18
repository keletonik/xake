import { describe, expect, it } from "vitest";
import {
  AssistantActionEnvelope,
  MarketSummarySchema,
  WatchlistDraftSchema,
  validateAction
} from "./schemas";

describe("ai-core schemas", () => {
  it("MarketSummary validates a complete payload", () => {
    const r = MarketSummarySchema.safeParse({
      symbol: "AAPL",
      timeframe: "1h",
      narrative: "Range-bound with no decisive structure yet.",
      bullishPoints: ["holding the 20EMA"],
      bearishPoints: [],
      risks: ["CPI on Thursday"],
      confidence: "medium",
      sources: ["TradingEconomics"]
    });
    expect(r.success).toBe(true);
  });

  it("WatchlistDraft rejects empty item lists", () => {
    const r = WatchlistDraftSchema.safeParse({ name: "AI", items: [] });
    expect(r.success).toBe(false);
  });

  it("AssistantActionEnvelope only accepts known kinds", () => {
    const bad = AssistantActionEnvelope.safeParse({ kind: "unknown", payload: {} });
    expect(bad.success).toBe(false);
  });

  it("validateAction returns the parsed action on success", () => {
    const action = validateAction({
      kind: "watchlist_draft",
      payload: {
        name: "AI infra",
        items: [{ symbol: "NVDA", addedAt: 1, tags: [], pinned: false }]
      }
    });
    expect(action?.kind).toBe("watchlist_draft");
  });

  it("rejects an order_draft with invalid side", () => {
    const r = AssistantActionEnvelope.safeParse({
      kind: "order_draft",
      payload: { symbol: "AAPL", side: "hold", type: "market", quantity: 1 }
    });
    expect(r.success).toBe(false);
  });
});

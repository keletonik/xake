import { describe, expect, it } from "vitest";
import {
  buildAlert,
  computeDedupeHash,
  evaluateQuote,
  findDuplicate,
  isCoolingDown,
  matchesCondition
} from "./alerts";
import type { Alert, AlertDraft } from "./types";

const draft = (over: Partial<AlertDraft> = {}): AlertDraft => ({
  name: "AAPL above 230",
  condition: { kind: "price_above", symbol: "AAPL", threshold: 230 },
  channels: ["in_app"],
  cooldownSeconds: 60,
  ...over
});

describe("alerts", () => {
  it("produces a stable dedupe hash for identical conditions", () => {
    const h1 = computeDedupeHash("acc", draft().condition);
    const h2 = computeDedupeHash("acc", draft().condition);
    expect(h1).toEqual(h2);
  });

  it("findDuplicate returns an existing active alert with the same hash", () => {
    const a1 = buildAlert(draft(), "acc", () => "id-1", 1);
    const dupe = findDuplicate("acc", draft().condition, [a1]);
    expect(dupe?.id).toBe("id-1");
  });

  it("matchesCondition enforces price-above strictly above threshold", () => {
    expect(matchesCondition({ kind: "price_above", symbol: "AAPL", threshold: 230 }, { symbol: "AAPL", last: 230.0000001, timestamp: 1 })).toBe(true);
    expect(matchesCondition({ kind: "price_above", symbol: "AAPL", threshold: 230 }, { symbol: "AAPL", last: 230, timestamp: 1 })).toBe(false);
  });

  it("matchesCondition for pct_move respects direction", () => {
    const cond = { kind: "pct_move" as const, symbol: "AAPL", percent: 2, direction: "up" as const };
    expect(matchesCondition(cond, { symbol: "AAPL", last: 102, open: 100, timestamp: 1 })).toBe(true);
    expect(matchesCondition(cond, { symbol: "AAPL", last: 98, open: 100, timestamp: 1 })).toBe(false);
  });

  it("cooldown suppresses back-to-back fires", () => {
    const a: Alert = { ...buildAlert(draft({ cooldownSeconds: 60 }), "acc", () => "id-1", 1_000), lastFiredAt: 1_000 };
    expect(isCoolingDown(a, 30_000)).toBe(true);
    expect(isCoolingDown(a, 70_000)).toBe(false);
  });

  it("evaluateQuote fires once and flags the alert as fired", () => {
    const a = buildAlert(draft(), "acc", () => "id-1", 1);
    const r = evaluateQuote({ symbol: "AAPL", last: 240, timestamp: 100 }, [a], {}, 100, () => "evt-1");
    expect(r.fired).toHaveLength(1);
    expect(r.updatedAlerts[0]!.lastFiredAt).toBe(100);
  });
});

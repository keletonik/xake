import { describe, expect, it } from "vitest";
import { alignToTimeframe, ageMs, isStale, mergeTickIntoCandle } from "./normalise";
import type { Quote } from "./types";

describe("normalise", () => {
  it("alignToTimeframe buckets correctly for 1m", () => {
    const t = 1_700_000_061_000; // 61 seconds into the minute
    expect(alignToTimeframe(t, "1m")).toBe(1_700_000_040_000);
  });

  it("ageMs returns non-negative", () => {
    const q: Quote = {
      instrumentId: "x",
      symbol: "X",
      last: 1,
      timestamp: Date.now() + 5000, // in the future → age clamps to 0
      attribution: { source: "mock", feedClass: "mock", ageMs: 0, receivedAt: Date.now() }
    };
    expect(ageMs(q)).toBe(0);
  });

  it("isStale flips past the threshold", () => {
    const q: Quote = {
      instrumentId: "x",
      symbol: "X",
      last: 1,
      timestamp: Date.now() - 10_000,
      attribution: { source: "mock", feedClass: "mock", ageMs: 0, receivedAt: Date.now() }
    };
    expect(isStale(q, 5000)).toBe(true);
  });

  it("mergeTickIntoCandle creates a new bar at bucket boundaries", () => {
    // t0 must be aligned to a 1m boundary for the assertions below to hold.
    const t0 = 1_700_000_040_000;
    const c1 = mergeTickIntoCandle(null, 100, 5, t0, "inst", "1m");
    expect(c1.open).toBe(100);
    const c2 = mergeTickIntoCandle(c1, 101, 3, t0 + 30_000, "inst", "1m");
    expect(c2.high).toBe(101);
    const c3 = mergeTickIntoCandle(c2, 98, 2, t0 + 90_000, "inst", "1m");
    expect(c3.openTime).toBe(t0 + 60_000);
    expect(c3.open).toBe(98);
  });
});

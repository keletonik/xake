import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../app.js";

/**
 * Integration tests against the Hono app. We use app.request() to
 * drive full request/response cycles without spinning up a TCP socket.
 * These tests exercise the same route handlers that run on both Vercel
 * (via the Next.js mount) and Replit (via the standalone server).
 */

const USER_HEADER = { "x-xake-user-id": "test-user" };

// Seed at least one price so order submission can succeed.
beforeAll(async () => {
  const { store } = await import("../lib/store.js");
  store.recordPrice("AAPL", 200);
});

afterAll(() => undefined);

describe("health", () => {
  it("GET /v1/health returns ok envelope", async () => {
    const res = await app.request("/v1/health");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.env).toBe("paper");
  });
});

describe("watchlists", () => {
  it("creates, lists, and deletes", async () => {
    const create = await app.request("/v1/watchlists", {
      method: "POST",
      headers: { "content-type": "application/json", ...USER_HEADER },
      body: JSON.stringify({ name: "Integration" })
    });
    expect(create.status).toBe(200);
    const { watchlist } = await create.json();
    expect(watchlist.name).toBe("Integration");

    const list = await app.request("/v1/watchlists", { headers: USER_HEADER });
    const listBody = await list.json();
    expect(listBody.items.some((w: { id: string }) => w.id === watchlist.id)).toBe(true);

    const del = await app.request(`/v1/watchlists/${watchlist.id}`, {
      method: "DELETE",
      headers: USER_HEADER
    });
    expect(del.status).toBe(200);
  });
});

describe("alerts", () => {
  it("rejects duplicate alert creation on the same condition", async () => {
    const body = {
      name: "AAPL above 300",
      condition: { kind: "price_above", symbol: "AAPL", threshold: 300 },
      channels: ["in_app"],
      cooldownSeconds: 60
    };
    const first = await app.request("/v1/alerts", {
      method: "POST",
      headers: { "content-type": "application/json", ...USER_HEADER },
      body: JSON.stringify(body)
    });
    expect(first.status).toBe(200);
    const second = await app.request("/v1/alerts", {
      method: "POST",
      headers: { "content-type": "application/json", ...USER_HEADER },
      body: JSON.stringify(body)
    });
    expect(second.status).toBe(409);
  });
});

describe("orders", () => {
  it("accepts a valid paper market buy and rejects a live order", async () => {
    const ok = await app.request("/v1/orders", {
      method: "POST",
      headers: { "content-type": "application/json", ...USER_HEADER },
      body: JSON.stringify({
        symbol: "AAPL",
        side: "buy",
        type: "market",
        quantity: 1,
        tif: "day",
        env: "paper"
      })
    });
    expect(ok.status).toBe(200);
    const okBody = await ok.json();
    expect(okBody.order.status).toBe("filled");

    const live = await app.request("/v1/orders", {
      method: "POST",
      headers: { "content-type": "application/json", ...USER_HEADER },
      body: JSON.stringify({
        symbol: "AAPL",
        side: "buy",
        type: "market",
        quantity: 1,
        tif: "day",
        env: "live"
      })
    });
    expect(live.status).toBe(403);
  });
});

describe("preferences", () => {
  it("reads defaults and updates partially", async () => {
    const get = await app.request("/v1/preferences", { headers: USER_HEADER });
    expect(get.status).toBe(200);
    const base = await get.json();
    expect(base.preferences.theme).toBe("dark");

    const patch = await app.request("/v1/preferences", {
      method: "PATCH",
      headers: { "content-type": "application/json", ...USER_HEADER },
      body: JSON.stringify({ theme: "darker", defaultSymbol: "NVDA" })
    });
    expect(patch.status).toBe(200);
    const patched = await patch.json();
    expect(patched.preferences.theme).toBe("darker");
    expect(patched.preferences.defaultSymbol).toBe("NVDA");
  });
});

describe("cron", () => {
  it("evaluate-alerts returns a summary envelope", async () => {
    const res = await app.request("/v1/cron/evaluate-alerts");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(typeof body.fired).toBe("number");
  });
});

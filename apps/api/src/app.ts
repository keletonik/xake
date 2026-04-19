/**
 * Pure Hono application. Exported so the same routes serve both:
 *   - the standalone Node server (apps/api/src/server.ts) on Replit/Fly/self-hosted
 *   - the Next.js route handler (apps/web/app/api/[[...path]]/route.ts) on Vercel
 *
 * Keep this file free of any `serve()` calls and any long-running side
 * effects. Long-running setup lives in server.ts.
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "./env.js";
import { alertsRoutes } from "./routes/alerts.js";
import { assistantRoutes } from "./routes/assistant.js";
import { cronRoutes } from "./routes/cron.js";
import { healthRoutes } from "./routes/health.js";
import { instrumentsRoutes } from "./routes/instruments.js";
import { ordersRoutes } from "./routes/orders.js";
import { portfolioRoutes } from "./routes/portfolio.js";
import { preferencesRoutes } from "./routes/preferences.js";
import { streamRoutes } from "./routes/stream.js";
import { watchlistsRoutes } from "./routes/watchlists.js";

export const app = new Hono().basePath(env.API_BASE_PATH);

app.use(
  "*",
  cors({
    origin: env.ALLOWED_ORIGINS,
    credentials: true
  })
);

// Demo-mode bridge: EventSource can't set custom headers, so the web
// layer writes the demo id to a cookie. Promote the cookie to the
// header the route handlers already read, so SSE and REST share one
// identity resolution path.
app.use("*", async (c, next) => {
  if (!c.req.header("x-xake-demo-id")) {
    const cookie = c.req.header("cookie") ?? "";
    const match = cookie.split(";").map((s) => s.trim()).find((s) => s.startsWith("xake-demo-id="));
    if (match) {
      const value = decodeURIComponent(match.slice("xake-demo-id=".length));
      if (value) c.req.raw.headers.set("x-xake-demo-id", value);
    }
  }
  await next();
});

app.route("/", healthRoutes);
app.route("/", instrumentsRoutes);
app.route("/", streamRoutes);
app.route("/", watchlistsRoutes);
app.route("/", alertsRoutes);
app.route("/", portfolioRoutes);
app.route("/", ordersRoutes);
app.route("/", assistantRoutes);
app.route("/", preferencesRoutes);
app.route("/", cronRoutes);

app.notFound((c) => c.json({ error: "NOT_FOUND", path: c.req.path }, 404));

app.onError((err, c) => {
  console.error("[xake:api] unhandled", err);
  return c.json({ error: "INTERNAL", detail: err.message }, 500);
});

export type AppType = typeof app;

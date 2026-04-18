import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "./env.js";
import { alertsRoutes } from "./routes/alerts.js";
import { assistantRoutes } from "./routes/assistant.js";
import { healthRoutes } from "./routes/health.js";
import { instrumentsRoutes } from "./routes/instruments.js";
import { ordersRoutes } from "./routes/orders.js";
import { portfolioRoutes } from "./routes/portfolio.js";
import { streamRoutes } from "./routes/stream.js";
import { watchlistsRoutes } from "./routes/watchlists.js";
import { streamManager } from "./services/stream-manager.js";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: [env.APP_URL, "http://localhost:3000"],
    credentials: true
  })
);

app.route("/", healthRoutes);
app.route("/", instrumentsRoutes);
app.route("/", streamRoutes);
app.route("/", watchlistsRoutes);
app.route("/", alertsRoutes);
app.route("/", portfolioRoutes);
app.route("/", ordersRoutes);
app.route("/", assistantRoutes);

app.notFound((c) => c.json({ error: "NOT_FOUND" }, 404));

app.onError((err, c) => {
  console.error("[xake:api] unhandled", err);
  return c.json({ error: "INTERNAL", detail: err.message }, 500);
});

await streamManager.start();

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`[xake:api] listening on :${info.port} (env=${env.XAKE_ENV})`);
});

const shutdown = async (signal: string) => {
  console.log(`[xake:api] received ${signal}`);
  await streamManager.stop();
  process.exit(0);
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

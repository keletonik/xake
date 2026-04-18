/**
 * Standalone server. Only used on long-running hosts (Replit, Fly,
 * Railway, Docker, local dev without Next.js mounted API). On Vercel,
 * the same `app` is imported by apps/web as a route handler.
 */

import { serve } from "@hono/node-server";
import { createPlatformContext } from "@xake/platform";
import { app } from "./app.js";
import { env } from "./env.js";
import { streamManager } from "./services/stream-manager.js";

const platform = createPlatformContext();

await streamManager.start();

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(
    `[xake:api] standalone server on :${info.port} env=${env.XAKE_ENV} target=${platform.target}`
  );
  console.log(`[xake:api] capabilities: ${platform.capabilities.note}`);
});

const shutdown = async (signal: string) => {
  console.log(`[xake:api] received ${signal}`);
  await streamManager.stop();
  await platform.cron.stop();
  process.exit(0);
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

import { Hono } from "hono";
import { env, isClaudeEnabled } from "../env.js";
import { streamManager } from "../services/stream-manager.js";

export const healthRoutes = new Hono();

healthRoutes.get("/v1/health", (c) =>
  c.json({
    ok: true,
    service: "xake-api",
    env: env.XAKE_ENV,
    providers: streamManager.health(),
    claude: { enabled: isClaudeEnabled(), defaultModel: env.CLAUDE_DEFAULT_MODEL },
    now: Date.now()
  })
);

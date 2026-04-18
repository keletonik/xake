/**
 * Barrel export. The Hono `app` is the public contract; both the
 * standalone server and the Vercel Next.js route handler import it.
 */
export { app } from "./app.js";
export type { AppType } from "./app.js";
export { streamManager } from "./services/stream-manager.js";
export { runAssistant } from "./services/ai-service.js";
export { env } from "./env.js";

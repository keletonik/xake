/**
 * Env loader. Reads from process.env — works on Node, Vercel Functions,
 * and Replit. Secrets never flow to the browser. All Next.js API route
 * handlers import from here via the shared Hono app.
 */

import { resolveTarget, type DeployTarget } from "@xake/platform";

const raw = (key: string): string | undefined =>
  typeof process !== "undefined" ? process.env?.[key] : undefined;

const bool = (key: string): boolean => raw(key) === "true" || raw(key) === "1";
const numOr = (key: string, fallback: number): number => {
  const v = raw(key);
  return v === undefined ? fallback : Number(v);
};

const originsList = (): string[] => {
  const cfg = raw("ALLOWED_ORIGINS");
  if (cfg) return cfg.split(",").map((s) => s.trim()).filter(Boolean);
  const appUrl = raw("APP_URL") ?? "http://localhost:3000";
  return [appUrl, "http://localhost:3000"];
};

export const env = {
  DEPLOY_TARGET: resolveTarget(raw("DEPLOY_TARGET")) as DeployTarget,

  PORT: numOr("PORT", 4000),
  XAKE_ENV: (raw("XAKE_ENV") ?? "paper") as "paper" | "live",
  APP_URL: raw("APP_URL") ?? "http://localhost:3000",
  API_BASE_PATH: raw("API_BASE_PATH") ?? "",
  ALLOWED_ORIGINS: originsList(),

  // Database
  DATABASE_URL: raw("DATABASE_URL"),
  DATABASE_POOL_MAX: numOr("DATABASE_POOL_MAX", 5),

  // Redis (optional)
  REDIS_URL: raw("REDIS_URL"),

  // Clerk
  CLERK_SECRET_KEY: raw("CLERK_SECRET_KEY") ?? "",
  CLERK_PUBLISHABLE_KEY: raw("CLERK_PUBLISHABLE_KEY") ?? raw("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY") ?? "",

  // Assistant (model provider keys / model IDs are factual; env names are generic)
  ASSISTANT_API_KEY: raw("ASSISTANT_API_KEY") ?? raw("ANTHROPIC_API_KEY") ?? "",
  ASSISTANT_DEFAULT_MODEL:
    raw("ASSISTANT_DEFAULT_MODEL") ?? raw("CLAUDE_DEFAULT_MODEL") ?? "claude-sonnet-4-6",
  ASSISTANT_FAST_MODEL:
    raw("ASSISTANT_FAST_MODEL") ?? raw("CLAUDE_FAST_MODEL") ?? "claude-haiku-4-5-20251001",

  // Feeds
  ENABLE_COINBASE_FEED: bool("ENABLE_COINBASE_FEED"),

  // Cron
  CRON_SECRET: raw("CRON_SECRET") ?? "",

  // Demo (used only when Clerk isn't configured)
  DEMO_ACCOUNT_ID: raw("DEMO_ACCOUNT_ID") ?? "demo-account"
} as const;

export const isAssistantEnabled = (): boolean => env.ASSISTANT_API_KEY.length > 0;
export const isClerkEnabled = (): boolean => env.CLERK_SECRET_KEY.length > 0;
export const isDatabaseEnabled = (): boolean => !!env.DATABASE_URL;

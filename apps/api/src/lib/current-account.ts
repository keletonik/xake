import type { Context } from "hono";
import { env, isClerkEnabled } from "../env.js";

/**
 * Resolve the caller's account id for API handlers.
 *
 * Resolution order (first match wins):
 *   1. Demo mode. A browser that has opted into demo mode sends
 *      `x-xake-demo-id` (set by the web layer). The API maps each
 *      distinct demo id to its own isolated account so two demo
 *      tabs don't pollute each other. Demo ids are always prefixed
 *      `demo_` so they never collide with Clerk user ids.
 *   2. Clerk. When configured, the middleware stamps `x-xake-user-id`
 *      from the session. The API trusts that header because the Next
 *      middleware is the only party able to set request headers.
 *   3. DEMO_ACCOUNT_ID. The single-user dev fallback. Safe only for
 *      local development and explicitly-labelled demo deployments.
 */

export const DEMO_ID_PREFIX = "demo_";

export const isDemoAccount = (accountId: string): boolean =>
  accountId === env.DEMO_ACCOUNT_ID || accountId.startsWith(DEMO_ID_PREFIX);

export const currentAccountId = (c: Context): string => {
  const demoHeader = c.req.header("x-xake-demo-id");
  if (demoHeader && demoHeader.length > 0) {
    const safe = demoHeader.replace(/[^a-z0-9_-]/gi, "").slice(0, 64);
    return `${DEMO_ID_PREFIX}${safe}`;
  }

  if (isClerkEnabled()) {
    const header = c.req.header("x-xake-user-id");
    if (header && header.length > 0) return header;
  }
  return env.DEMO_ACCOUNT_ID;
};

export const currentAccountMode = (c: Context): "demo" | "user" | "fallback" => {
  if (c.req.header("x-xake-demo-id")) return "demo";
  if (isClerkEnabled() && c.req.header("x-xake-user-id")) return "user";
  return "fallback";
};

import type { Context } from "hono";
import { env, isClerkEnabled } from "../env.js";

/**
 * Resolve the caller's account id for API handlers.
 *
 * Strategy:
 *   1. If Clerk is configured, read the Clerk user id from the
 *      `X-Xake-User-Id` header set by the Next.js middleware in
 *      apps/web. This keeps auth logic in the web layer while
 *      letting the Hono app stay framework-agnostic.
 *   2. Otherwise, fall back to the demo account. Clearly logged.
 *
 * The header approach means the standalone server can still be
 * protected by an upstream proxy or a different auth layer without
 * leaking Clerk internals into the API.
 */

export const currentAccountId = (c: Context): string => {
  if (isClerkEnabled()) {
    const header = c.req.header("x-xake-user-id");
    if (header && header.length > 0) return header;
  }
  return env.DEMO_ACCOUNT_ID;
};

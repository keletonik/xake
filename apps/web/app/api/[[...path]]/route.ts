/**
 * Mount the Hono API at /api/* inside the Next.js app. This is what
 * makes Vercel deployments work: each request to /api/v1/... runs as a
 * Vercel Function that invokes the same Hono `app` the standalone
 * server uses.
 *
 * The Hono app registers routes without a `/api` prefix (so it can run
 * standalone on port 4000). Here we wrap the Vercel adapter so incoming
 * Next.js requests strip the `/api` prefix before Hono routing.
 */

import { app } from "@xake/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  // Strip the leading /api so Hono routes (/v1/*) match.
  if (url.pathname.startsWith("/api/")) {
    url.pathname = url.pathname.slice(4) || "/";
  } else if (url.pathname === "/api") {
    url.pathname = "/";
  }
  const rewritten = new Request(url, req);
  return app.fetch(rewritten);
};

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
export const OPTIONS = handler;

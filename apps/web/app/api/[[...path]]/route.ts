/**
 * Mount the Hono API at /api/* inside the Next.js app. This is what
 * makes Vercel deployments work: each request to /api/v1/... runs as a
 * Vercel Function that invokes the same Hono `app` the standalone
 * server uses.
 *
 * The Hono app registers routes without a `/api` prefix (so it can run
 * standalone on port 4000). Here we strip the `/api` prefix before
 * forwarding, carrying the method, headers, and body through with a
 * single new Request object.
 */

import { app } from "@xake/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  if (url.pathname.startsWith("/api/")) {
    url.pathname = url.pathname.slice(4) || "/";
  } else if (url.pathname === "/api") {
    url.pathname = "/";
  }

  const init: RequestInit & { duplex?: "half" } = {
    method: req.method,
    headers: req.headers,
    redirect: "manual",
    signal: req.signal
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.body;
    // Node 18+ fetch requires `duplex: "half"` when streaming a body.
    init.duplex = "half";
  }

  return app.fetch(new Request(url, init));
};

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
export const OPTIONS = handler;

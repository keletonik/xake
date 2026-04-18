/**
 * Mount the Hono API at /api/* inside the Next.js app. This is what
 * makes Vercel deployments work: each request to /api/v1/... runs as a
 * Vercel Function that invokes the same Hono `app` the standalone
 * server uses.
 *
 * On Replit or any long-running Node host, this file is still valid —
 * but the preferred path is the standalone server on its own port so
 * persistent upstream WS connections (Coinbase) can run. See
 * docs/deployment/adapters.md for the full matrix.
 */

import { app } from "@xake/api";
import { handle } from "hono/vercel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
export const OPTIONS = handler;

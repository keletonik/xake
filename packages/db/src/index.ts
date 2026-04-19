/**
 * @xake/db — Postgres connection and typed query helpers.
 *
 * Designed for both long-running hosts (Replit Reserved VM, Fly) and
 * serverless functions (Vercel). On Vercel the connection is lazily
 * established per function invocation with `max: 1` / `idle_timeout: 10`.
 *
 * Note: the migration runner lives at `./migrate.js` and imports Node
 * built-ins (`node:fs`, `node:path`). It is NOT re-exported here — the
 * CLI is invoked via `pnpm --filter @xake/db migrate`, which runs
 * migrate.ts directly under `tsx`. Keeping it out of the barrel means
 * client bundles that import `@xake/db` (for repository types) do not
 * pull Node-only modules into the browser.
 */

import postgres from "postgres";

export type Sql = postgres.Sql<Record<string, never>>;

interface ConnectionOptions {
  readonly url: string;
  readonly max?: number;
  readonly idleTimeoutSeconds?: number;
  readonly ssl?: boolean | "require" | "verify-full";
}

let cached: Sql | null = null;

export const connect = (opts: ConnectionOptions): Sql => {
  if (cached) return cached;
  const max = opts.max ?? (isServerless() ? 1 : 5);
  const sslOption =
    opts.ssl ??
    (opts.url.includes("sslmode=require") || opts.url.includes("sslmode=verify-full") ? "require" : (isServerless() ? "require" : false));
  cached = postgres(opts.url, {
    max,
    idle_timeout: opts.idleTimeoutSeconds ?? (isServerless() ? 10 : 60),
    prepare: false,
    ssl: sslOption
  });
  return cached;
};

export const disconnect = async (): Promise<void> => {
  if (!cached) return;
  await cached.end({ timeout: 5 });
  cached = null;
};

const isServerless = (): boolean => {
  if (typeof process === "undefined") return false;
  return process.env.VERCEL === "1" || !!process.env.VERCEL_URL || process.env.DEPLOY_TARGET === "vercel";
};

export * from "./repositories/index.js";
export * from "./factory.js";

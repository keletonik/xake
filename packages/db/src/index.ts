/**
 * @xake/db — Postgres connection and typed query helpers.
 *
 * Designed for both long-running hosts (Replit Reserved VM, Fly) and
 * serverless functions (Vercel). On Vercel the connection is lazily
 * established per function invocation via `postgres()` with `max: 1`
 * and `idle_timeout: 10` — standard serverless settings.
 *
 * The in-memory store in apps/api remains available as a fallback for
 * local development without a DATABASE_URL. Swap one for the other by
 * calling `makeRepository({ databaseUrl })`.
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

export { loadMigrations, runMigrations } from "./migrate.js";
export * from "./repositories/index.js";

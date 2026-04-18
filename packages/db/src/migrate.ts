/**
 * Simple migration runner.
 *
 * Usage:
 *   DATABASE_URL=postgres://… pnpm --filter @xake/db migrate
 *
 * Reads .sql files from infra/db/migrations in ordered filename sequence
 * and applies anything not already in the `schema_migrations` ledger.
 */

import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { connect, type Sql } from "./index.js";

const MIGRATIONS_DIR = resolve(process.cwd(), "infra/db/migrations");

export interface Migration {
  readonly name: string;
  readonly sql: string;
}

export const loadMigrations = async (dir = MIGRATIONS_DIR): Promise<Migration[]> => {
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  const out: Migration[] = [];
  for (const f of files) {
    const sql = await readFile(resolve(dir, f), "utf8");
    out.push({ name: f, sql });
  }
  return out;
};

export const runMigrations = async (sql: Sql, migrations: Migration[]): Promise<string[]> => {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  const applied = new Set(
    (await sql<{ name: string }[]>`SELECT name FROM schema_migrations`).map((r) => r.name)
  );
  const executed: string[] = [];
  for (const m of migrations) {
    if (applied.has(m.name)) continue;
    await sql.begin(async (tx) => {
      await tx.unsafe(m.sql);
      await tx`INSERT INTO schema_migrations (name) VALUES (${m.name})`;
    });
    executed.push(m.name);
  }
  return executed;
};

// CLI entry
if (import.meta.url === `file://${process.argv[1]}`) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }
  const sql = connect({ url });
  try {
    const migrations = await loadMigrations();
    const executed = await runMigrations(sql, migrations);
    if (executed.length === 0) console.log("[xake:db] up to date");
    else for (const n of executed) console.log(`[xake:db] applied ${n}`);
  } catch (err) {
    console.error("[xake:db] migration failed", err);
    process.exit(1);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

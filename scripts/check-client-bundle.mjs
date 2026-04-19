#!/usr/bin/env node
/**
 * Build-time guard. After `next build`, this script scans the client
 * chunks under apps/web/.next/static for any `node:` scheme imports.
 * If even one appears, the script exits non-zero so CI blocks the
 * release.
 *
 * The trigger is the exact bug that brought the build down on the
 * Replit preview — `node:crypto` leaking into the browser bundle via
 * a package barrel. The guard ensures that mistake cannot land silently
 * again.
 *
 * Usage: `node scripts/check-client-bundle.mjs` after `pnpm build`.
 */

import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd(), "apps/web/.next/static");

const walk = async (dir) => {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    const info = await stat(full);
    if (info.isDirectory()) {
      out.push(...(await walk(full)));
    } else if (entry.endsWith(".js")) {
      out.push(full);
    }
  }
  return out;
};

const BAD_PATTERNS = [
  /from\s*["']node:/,
  /require\(\s*["']node:/
];

const run = async () => {
  try {
    await stat(ROOT);
  } catch {
    console.log(`[xake:check] ${ROOT} not found; run \`pnpm build\` first.`);
    process.exit(0);
  }
  const files = await walk(ROOT);
  const hits = [];
  for (const file of files) {
    const contents = await readFile(file, "utf8");
    for (const pattern of BAD_PATTERNS) {
      if (pattern.test(contents)) {
        hits.push({ file, pattern: pattern.source });
        break;
      }
    }
  }
  if (hits.length === 0) {
    console.log(`[xake:check] OK — scanned ${files.length} client chunks, no node: imports found.`);
    return;
  }
  console.error(`[xake:check] FAIL — client chunks contain node: imports:`);
  for (const hit of hits) {
    console.error(`  ${hit.file}  (pattern: ${hit.pattern})`);
  }
  console.error(
    `\nFix: trace the offending module and replace node built-ins with isomorphic equivalents, or move the dependency out of any client-imported barrel.`
  );
  process.exit(1);
};

run().catch((err) => {
  console.error("[xake:check] unexpected error", err);
  process.exit(2);
});

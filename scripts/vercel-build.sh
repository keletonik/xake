#!/usr/bin/env bash
# Vercel build step — uses the same npx-pinned pnpm as the install
# step so there is zero ambiguity about which pnpm is building what.

set -eo pipefail

echo "[xake] building @xake/web with pnpm@9.12.0 via npx"
npx --yes pnpm@9.12.0 --filter @xake/web run build

echo "[xake] running client-bundle guard"
node scripts/check-client-bundle.mjs

echo "[xake] build complete"

#!/usr/bin/env bash
# Vercel build — reuses the static pnpm installed by vercel-install.sh.

set -eo pipefail

PNPM_BIN_DIR="$HOME/.xake-pnpm-bin"
if [ -x "$PNPM_BIN_DIR/pnpm" ]; then
  export PATH="$PNPM_BIN_DIR:$PATH"
fi

echo "[xake] pnpm: $(pnpm --version 2>/dev/null || echo 'not found; install step did not run?')"

echo "[xake] building @xake/web"
pnpm --filter @xake/web run build

echo "[xake] running client-bundle guard"
node scripts/check-client-bundle.mjs

echo "[xake] build complete"

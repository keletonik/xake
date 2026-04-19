#!/usr/bin/env bash
# Vercel install step — tolerant of whatever pnpm Vercel pre-installs.
#
# Strategy: try corepack first (Node's official version-manager), then
# npm -g as a fallback, and finally invoke pnpm 9.12.0 via npx so the
# install always runs under the pinned version regardless of what's on
# PATH.

set -eo pipefail

echo "[xake] node: $(node --version 2>/dev/null || echo missing)"
echo "[xake] npm:  $(npm --version 2>/dev/null || echo missing)"
echo "[xake] pnpm-preinstalled: $(pnpm --version 2>/dev/null || echo none)"

# Layer 1: corepack (preferred, Node-native)
if command -v corepack >/dev/null 2>&1; then
  corepack enable >/dev/null 2>&1 || true
  corepack prepare pnpm@9.12.0 --activate >/dev/null 2>&1 || true
  echo "[xake] corepack activated pnpm: $(pnpm --version 2>/dev/null || echo unknown)"
fi

# Layer 2: npm global install (belt)
npm install -g pnpm@9.12.0 --force >/dev/null 2>&1 || true
echo "[xake] post-npm-global pnpm: $(pnpm --version 2>/dev/null || echo unknown)"

# Layer 3: npx invocation of the exact version (braces — always works)
echo "[xake] installing workspace with pnpm@9.12.0 via npx"
npx --yes pnpm@9.12.0 install --no-frozen-lockfile

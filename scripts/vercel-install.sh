#!/usr/bin/env bash
# Vercel install — maximum-paranoia version.
#
# Downloads the pnpm 9.12.0 static binary directly from GitHub releases
# and prepends its directory to PATH. Does NOT depend on Vercel's
# pre-installed pnpm, corepack, node's package manager, or anything
# else that might be the wrong version.

set -eo pipefail

echo "[xake] node: $(node --version 2>/dev/null || echo missing)"
echo "[xake] npm:  $(npm --version 2>/dev/null || echo missing)"
echo "[xake] pnpm-preinstalled: $(pnpm --version 2>/dev/null || echo none)"

PNPM_VERSION="9.12.0"
PNPM_BIN_DIR="$HOME/.xake-pnpm-bin"
PNPM_BIN="$PNPM_BIN_DIR/pnpm"

mkdir -p "$PNPM_BIN_DIR"

# Try corepack first — cheapest if it works.
if command -v corepack >/dev/null 2>&1; then
  corepack enable >/dev/null 2>&1 || true
  corepack prepare "pnpm@${PNPM_VERSION}" --activate >/dev/null 2>&1 || true
fi

# Download the static-linked binary straight from pnpm's release page.
# This single file is pnpm 9.12.0 with zero external dependencies.
if [ ! -x "$PNPM_BIN" ]; then
  ARCH="$(uname -m)"
  case "$ARCH" in
    x86_64)   PNPM_SUFFIX="linuxstatic-x64" ;;
    aarch64)  PNPM_SUFFIX="linuxstatic-arm64" ;;
    *)        echo "[xake] unsupported arch: $ARCH"; exit 1 ;;
  esac
  URL="https://github.com/pnpm/pnpm/releases/download/v${PNPM_VERSION}/pnpm-${PNPM_SUFFIX}"
  echo "[xake] downloading pnpm ${PNPM_VERSION} static binary"
  echo "[xake]   ${URL}"
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$URL" -o "$PNPM_BIN"
  else
    wget -q "$URL" -O "$PNPM_BIN"
  fi
  chmod +x "$PNPM_BIN"
fi

# Put it first on PATH for the rest of the script and anything
# subsequent shell steps run during this Vercel build.
export PATH="$PNPM_BIN_DIR:$PATH"

echo "[xake] pnpm now resolves to: $(command -v pnpm)"
echo "[xake] pnpm version:        $(pnpm --version)"

echo "[xake] installing workspace dependencies"
pnpm install --no-frozen-lockfile

/**
 * Env validation. Keep this tiny — the real env schema lives in
 * @xake/config at Stage 1 and is wired in a later refactor. For now we
 * just read from process.env with conservative defaults.
 */

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  XAKE_ENV: (process.env.XAKE_ENV ?? "paper") as "paper" | "live",
  APP_URL: process.env.APP_URL ?? "http://localhost:3000",
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
  CLAUDE_DEFAULT_MODEL: process.env.CLAUDE_DEFAULT_MODEL ?? "claude-sonnet-4-6",
  CLAUDE_FAST_MODEL: process.env.CLAUDE_FAST_MODEL ?? "claude-haiku-4-5-20251001",
  ENABLE_COINBASE_FEED: (process.env.ENABLE_COINBASE_FEED ?? "false") === "true",
  DEMO_ACCOUNT_ID: process.env.DEMO_ACCOUNT_ID ?? "demo-account"
} as const;

export const isClaudeEnabled = (): boolean => env.ANTHROPIC_API_KEY.length > 0;

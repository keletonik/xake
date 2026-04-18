export const AI_CORE_PACKAGE = "@xake/ai-core";
export const AI_CORE_STAGE = 0;

export const MODEL_TIERS = {
  default: "claude-sonnet-4-6",
  fast: "claude-haiku-4-5-20251001",
  heavy: "claude-opus-4-7"
} as const;

export type ModelTier = keyof typeof MODEL_TIERS;

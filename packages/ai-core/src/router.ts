/**
 * Model router. Choose a Claude tier based on task shape. Defaults
 * come from docs — Sonnet 4.6 for interactive work, Haiku 4.5 for
 * lightweight summaries, Opus 4.7 gated behind admin/premium.
 */

export const MODELS = {
  default: "claude-sonnet-4-6",
  fast: "claude-haiku-4-5-20251001",
  heavy: "claude-opus-4-7"
} as const;

export type ModelTier = keyof typeof MODELS;

export interface RouteHint {
  readonly kind: "chat" | "summary" | "classification" | "long_reasoning";
  readonly premium?: boolean;
}

export const selectModel = (hint: RouteHint): string => {
  if (hint.premium && hint.kind === "long_reasoning") return MODELS.heavy;
  if (hint.kind === "summary" || hint.kind === "classification") return MODELS.fast;
  return MODELS.default;
};

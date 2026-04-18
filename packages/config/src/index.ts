export const CONFIG_PACKAGE = "@xake/config";
export const CONFIG_STAGE = 0;

export const FEATURE_FLAGS = {
  aiAssistant: false,
  liveExecution: false,
  newsLane: false
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

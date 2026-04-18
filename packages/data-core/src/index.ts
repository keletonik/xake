export const DATA_CORE_PACKAGE = "@xake/data-core";
export const DATA_CORE_STAGE = 0;

export type FeedClass = "realtime" | "delayed" | "indicative" | "mock";
export type AssetClass = "equity" | "fx" | "crypto" | "futures" | "index";

export interface ProviderAttribution {
  readonly source: string;
  readonly feedClass: FeedClass;
  readonly venue?: string;
  readonly ageMs: number;
}

import { ChartWorkspace } from "@/components/chart-workspace";
import { getMarketProvider } from "@/lib/data-core/mock-provider";
import type { Timeframe } from "@/lib/data-core/types";

export const dynamic = "force-dynamic";

export default async function ChartsPage({
  searchParams,
}: {
  searchParams: Promise<{ symbol?: string; tf?: string }>;
}) {
  const sp = await searchParams;
  const symbol = sp.symbol ?? "BTC-USD";
  const tf = (sp.tf ?? "15m") as Timeframe;
  const provider = getMarketProvider();
  const instruments = provider.listInstruments();
  const instrument = instruments.find((i) => i.symbol === symbol) ?? instruments[0];

  return (
    <ChartWorkspace
      initialSymbol={instrument.symbol}
      initialTf={tf}
      instruments={instruments.map((i) => ({
        symbol: i.symbol,
        name: i.displayName,
        assetClass: i.assetClass,
        tickSize: i.tickSize,
      }))}
    />
  );
}

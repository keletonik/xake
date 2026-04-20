import { MarketExplorer } from "@/components/market-explorer";
import { getMarketProvider } from "@/lib/data-core/mock-provider";

export const dynamic = "force-dynamic";

export default function MarketsPage() {
  const provider = getMarketProvider();
  const rows = provider.listInstruments().map((inst) => {
    const q = provider.getQuote(inst.symbol);
    return {
      symbol: inst.symbol,
      name: inst.displayName,
      assetClass: inst.assetClass,
      venue: inst.venue,
      tickSize: inst.tickSize,
      session: inst.session,
      marginFactor: inst.marginFactor,
      bid: q?.bid ?? null,
      ask: q?.ask ?? null,
      last: q?.last ?? null,
      changePct: q?.changePct ?? 0,
      dayHigh: q?.dayHigh ?? null,
      dayLow: q?.dayLow ?? null,
      dayVolume: q?.dayVolume ?? 0,
    };
  });

  return <MarketExplorer rows={rows} />;
}

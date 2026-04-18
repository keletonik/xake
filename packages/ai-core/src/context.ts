import type { PortfolioSnapshot } from "@xake/trading-core";

/**
 * Workspace context serialiser. Builds the compact "what the user is
 * looking at right now" payload the assistant conditions on. Keep
 * this small and deterministic — every token costs latency.
 */

export interface WorkspaceContext {
  readonly activeSymbol?: string;
  readonly activeTimeframe?: string;
  readonly selectedWatchlistId?: string;
  readonly selectedWatchlistName?: string;
  readonly watchlistSymbols?: string[];
  readonly portfolio?: PortfolioSnapshot;
  readonly recentAlerts?: Array<{ symbol: string; firedAt: number; triggerPrice: number; name: string }>;
  readonly timezone?: string;
  readonly nowIso?: string;
}

export const serialiseContext = (ctx: WorkspaceContext): string => {
  const lines: string[] = [];
  if (ctx.activeSymbol) {
    lines.push(`Active instrument: ${ctx.activeSymbol}${ctx.activeTimeframe ? ` (${ctx.activeTimeframe})` : ""}`);
  }
  if (ctx.selectedWatchlistName) {
    const members = ctx.watchlistSymbols?.slice(0, 20).join(", ") ?? "";
    lines.push(`Selected watchlist: ${ctx.selectedWatchlistName} [${members}]`);
  }
  if (ctx.portfolio) {
    const p = ctx.portfolio;
    const positions = p.positions
      .slice(0, 10)
      .map((pos) => `${pos.symbol} ${pos.quantity} @ ${pos.averageCost.toFixed(4)}`)
      .join("; ");
    lines.push(
      `Paper portfolio: cash ${p.balance.cash.toFixed(2)} ${p.balance.currency}, equity ${p.totalEquity.toFixed(2)}, realised ${p.totalRealisedPnl.toFixed(2)}, unrealised ${p.totalUnrealisedPnl.toFixed(2)}`
    );
    if (positions) lines.push(`Positions: ${positions}`);
  }
  if (ctx.recentAlerts?.length) {
    const alerts = ctx.recentAlerts
      .slice(0, 5)
      .map((a) => `${a.symbol} @ ${a.triggerPrice.toFixed(4)} (${a.name})`)
      .join("; ");
    lines.push(`Recent alerts: ${alerts}`);
  }
  if (ctx.timezone) lines.push(`Timezone: ${ctx.timezone}`);
  if (ctx.nowIso) lines.push(`Now: ${ctx.nowIso}`);
  return lines.join("\n");
};

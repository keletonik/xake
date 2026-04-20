import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ResetButton } from "@/components/reset-button";
import { currentAccountId } from "@/lib/auth/current-user";
import { getMarketProvider } from "@/lib/data-core/mock-provider";
import { snapshot } from "@/lib/trading-core/paper-engine";
import { store } from "@/lib/store/memory";
import { cn, formatPercent, formatUsd } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const accountId = await currentAccountId();
  const state = store.ensurePaper(accountId);
  const provider = getMarketProvider();
  const snap = snapshot(state, (s) => provider.getQuote(s));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <section className="grid grid-cols-2 gap-px border-b border-mute-10 bg-mute-10 md:grid-cols-4">
        <Metric label="Equity" value={formatUsd(snap.equity)} />
        <Metric label="Cash" value={formatUsd(snap.cash)} />
        <Metric
          label="Realised P&L"
          value={formatUsd(snap.realisedPnl)}
          tone={snap.realisedPnl >= 0 ? "up" : "down"}
        />
        <Metric
          label="Unrealised P&L"
          value={formatUsd(snap.unrealisedPnl)}
          tone={snap.unrealisedPnl >= 0 ? "up" : "down"}
        />
      </section>

      <section className="flex min-h-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-mute-10 px-6 py-4">
          <div>
            <div className="eyebrow">Positions</div>
            <div className="mt-1 font-sans text-[22px] font-medium tracking-crisp">
              {snap.positions.length} open
            </div>
          </div>
          <ResetButton />
        </header>

        {snap.positions.length === 0 ? (
          <EmptyState
            title="No positions"
            description="Place a paper order from the Paper screen to open a position."
          />
        ) : (
          <div className="overflow-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-mute-10">
                  {["Symbol", "Qty", "Avg cost", "Mark", "Unrealised", "Unrealised %", "Realised"].map((h, i) => (
                    <th
                      key={h}
                      className={cn(
                        "px-4 py-2 font-mono text-[10px] uppercase tracking-caps text-mute-50",
                        i === 0 ? "text-left" : "text-right",
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {snap.positions.map((p) => {
                  const q = provider.getQuote(p.symbol);
                  const mark = q?.last ?? p.avgCost;
                  const unrealised = (mark - p.avgCost) * p.qty;
                  const unrealisedPct = p.avgCost ? ((mark - p.avgCost) / p.avgCost) * 100 : 0;
                  return (
                    <tr key={p.symbol} className="border-b border-mute-6 font-mono text-[11px] uppercase tracking-caps">
                      <td className="px-4 py-2.5 text-fg">{p.symbol}</td>
                      <td className="px-4 py-2.5 text-right tabnums text-fg/80">{p.qty}</td>
                      <td className="px-4 py-2.5 text-right tabnums text-mute-70">
                        {formatUsd(p.avgCost)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabnums text-fg">{formatUsd(mark)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <Badge variant={unrealised >= 0 ? "up" : "down"} size="xs">
                          {formatUsd(unrealised)}
                        </Badge>
                      </td>
                      <td
                        className={cn(
                          "px-4 py-2.5 text-right tabnums",
                          unrealisedPct >= 0 ? "text-accent" : "text-down",
                        )}
                      >
                        {formatPercent(unrealisedPct)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabnums text-mute-70">
                        {formatUsd(p.realisedPnl)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "up" | "down";
}) {
  return (
    <div className="bg-bg p-6">
      <div className="eyebrow">{label}</div>
      <div
        className={cn(
          "mt-2 font-sans text-[24px] font-medium tracking-crisp tabnums",
          tone === "up" && "text-accent",
          tone === "down" && "text-down",
        )}
      >
        {value}
      </div>
    </div>
  );
}

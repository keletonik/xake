import Link from "next/link";
import { TickerTape } from "@/components/ticker-tape";
import { currentAccountId } from "@/lib/auth/current-user";
import { store } from "@/lib/store/memory";
import { getMarketProvider } from "@/lib/data-core/mock-provider";
import { snapshot } from "@/lib/trading-core/paper-engine";
import { digitsForTick, formatCompact, formatPercent, formatUsd } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const accountId = await currentAccountId();
  const wl = store.ensureWatchlist(accountId);
  const state = store.ensurePaper(accountId);
  const provider = getMarketProvider();
  const snap = snapshot(state, (s) => provider.getQuote(s));
  const alertCount = [...store.alerts.values()].filter((a) => a.accountId === accountId).length;
  const instruments = provider.listInstruments();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TickerTape symbols={wl.symbols} />

      <div className="grid flex-1 min-h-0 grid-cols-12 grid-rule">
        <section className="col-span-12 border-b border-mute-10 p-6 md:col-span-8">
          <div className="eyebrow mb-3">Account · paper</div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <Metric label="Equity" value={formatUsd(snap.equity)} />
            <Metric label="Cash" value={formatUsd(snap.cash)} />
            <Metric
              label="Unrealised"
              value={formatUsd(snap.unrealisedPnl)}
              tone={snap.unrealisedPnl >= 0 ? "up" : "down"}
            />
            <Metric
              label="Realised"
              value={formatUsd(snap.realisedPnl)}
              tone={snap.realisedPnl >= 0 ? "up" : "down"}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <Link
              href="/app/portfolio"
              className="group flex items-center justify-between border border-mute-10 p-5 hover:border-accent"
            >
              <div>
                <div className="eyebrow mb-1.5">Portfolio</div>
                <div className="font-sans text-[22px] font-medium tracking-crisp">
                  {snap.positions.length} positions
                </div>
              </div>
              <span className="font-mono text-[14px] text-mute-50 transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/app/alerts"
              className="group flex items-center justify-between border border-mute-10 p-5 hover:border-accent"
            >
              <div>
                <div className="eyebrow mb-1.5">Alerts</div>
                <div className="font-sans text-[22px] font-medium tracking-crisp">{alertCount} active</div>
              </div>
              <span className="font-mono text-[14px] text-mute-50 transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </section>

        <section className="col-span-12 border-b border-mute-10 p-6 md:col-span-4">
          <div className="eyebrow mb-3">Watchlist · {wl.name}</div>
          <ul className="space-y-2">
            {wl.symbols.slice(0, 8).map((s) => {
              const inst = instruments.find((i) => i.symbol === s);
              const q = provider.getQuote(s);
              const digits = inst ? digitsForTick(inst.tickSize) : 2;
              const pct = q?.changePct ?? 0;
              return (
                <li
                  key={s}
                  className="flex items-center justify-between border-b border-mute-6 pb-1.5 font-mono text-[11px] uppercase tracking-caps"
                >
                  <Link href={`/app/charts?symbol=${encodeURIComponent(s)}`} className="hover:text-accent">
                    {s}
                  </Link>
                  <div className="flex items-center gap-3 tabnums">
                    <span>{q ? q.last.toFixed(digits) : "—"}</span>
                    <span className={pct >= 0 ? "text-accent" : "text-down"}>{formatPercent(pct)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
          <Link
            href="/app/watchlists"
            className="mt-4 block border border-mute-20 px-3 py-2 text-center font-mono text-[10px] uppercase tracking-caps hover:border-accent hover:text-accent"
          >
            Manage watchlists →
          </Link>
        </section>

        <section className="col-span-12 p-6">
          <div className="eyebrow mb-3">Markets · top movers</div>
          <div className="grid grid-cols-2 gap-px bg-mute-10 md:grid-cols-4 lg:grid-cols-6">
            {instruments.slice(0, 12).map((inst) => {
              const q = provider.getQuote(inst.symbol);
              const digits = digitsForTick(inst.tickSize);
              const pct = q?.changePct ?? 0;
              return (
                <Link
                  key={inst.symbol}
                  href={`/app/charts?symbol=${encodeURIComponent(inst.symbol)}`}
                  className="flex flex-col gap-2 bg-bg p-4 hover:bg-mute-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-caps">{inst.symbol}</span>
                    <span className="font-mono text-[9px] uppercase tracking-caps text-mute-40">
                      {inst.assetClass}
                    </span>
                  </div>
                  <div className="font-sans text-[18px] font-medium tabnums">
                    {q ? q.last.toFixed(digits) : "—"}
                  </div>
                  <div className="flex items-center justify-between font-mono text-[10px] tabnums">
                    <span className={pct >= 0 ? "text-accent" : "text-down"}>
                      {formatPercent(pct)}
                    </span>
                    <span className="text-mute-40">{formatCompact(q?.dayVolume ?? 0)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
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
    <div>
      <div className="eyebrow">{label}</div>
      <div
        className={`mt-1.5 font-sans text-[24px] font-medium tracking-crisp tabnums ${
          tone === "up" ? "text-accent" : tone === "down" ? "text-down" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

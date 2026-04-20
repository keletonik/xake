"use client";

import * as React from "react";
import useSWR from "swr";
import { useRouter, useSearchParams } from "next/navigation";
import { ChartView } from "@/components/chart-view";
import { OrderBookPanel } from "@/components/order-book";
import type { AssetClass, Quote, Timeframe } from "@/lib/data-core/types";
import { cn, digitsForTick, formatCompact, formatPercent, formatPrice } from "@/lib/utils";

type InstrumentLite = {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  tickSize: number;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function ChartWorkspace({
  initialSymbol,
  initialTf,
  instruments,
}: {
  initialSymbol: string;
  initialTf: Timeframe;
  instruments: InstrumentLite[];
}) {
  const [symbol, setSymbol] = React.useState(initialSymbol);
  const [query, setQuery] = React.useState("");
  const router = useRouter();
  const params = useSearchParams();

  const inst = instruments.find((i) => i.symbol === symbol) ?? instruments[0];
  const digits = digitsForTick(inst.tickSize);

  const { data: quoteData } = useSWR<{ quotes: Quote[] }>(
    `/api/v1/quotes?symbols=${encodeURIComponent(symbol)}`,
    fetcher,
    { refreshInterval: 2_000 },
  );
  const quote = quoteData?.quotes[0];

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return instruments;
    return instruments.filter(
      (i) => i.symbol.toLowerCase().includes(q) || i.name.toLowerCase().includes(q),
    );
  }, [instruments, query]);

  function selectSymbol(next: string) {
    setSymbol(next);
    const sp = new URLSearchParams(params?.toString() ?? "");
    sp.set("symbol", next);
    router.replace(`/app/charts?${sp.toString()}`);
  }

  return (
    <div className="grid min-h-0 flex-1 grid-cols-12">
      <aside className="col-span-12 flex min-h-0 flex-col border-r border-mute-10 md:col-span-2">
        <div className="border-b border-mute-10 p-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-full border border-mute-20 bg-transparent px-3 py-1.5 font-mono text-[11px] uppercase tracking-caps placeholder:text-mute-40 focus:border-accent focus:outline-none"
          />
        </div>
        <div className="flex-1 overflow-auto scrollbar-thin">
          {filtered.map((i) => (
            <button
              key={i.symbol}
              onClick={() => selectSymbol(i.symbol)}
              className={cn(
                "flex w-full items-center justify-between border-b border-mute-6 px-3 py-2 text-left font-mono text-[10px] uppercase tracking-caps",
                i.symbol === symbol ? "bg-accent/10 text-accent" : "text-fg/80 hover:bg-mute-4",
              )}
            >
              <span>{i.symbol}</span>
              <span className="text-mute-40">{i.assetClass.slice(0, 3)}</span>
            </button>
          ))}
        </div>
      </aside>

      <div className="col-span-12 flex min-h-0 flex-col md:col-span-7">
        <div className="grid grid-cols-5 border-b border-mute-10">
          <div className="col-span-2 flex flex-col justify-center border-r border-mute-10 p-5">
            <div className="eyebrow">{inst.assetClass.toUpperCase()}</div>
            <div className="mt-1 font-sans text-[28px] font-medium tracking-crisp">{inst.symbol}</div>
            <div className="mt-0.5 font-mono text-[11px] uppercase tracking-caps text-mute-50">{inst.name}</div>
          </div>
          <Stat label="Last" value={quote ? formatPrice(quote.last, digits) : "—"} />
          <Stat
            label="Change"
            value={quote ? formatPercent(quote.changePct) : "—"}
            tone={quote && quote.changePct >= 0 ? "up" : "down"}
          />
          <Stat label="Volume" value={quote ? formatCompact(quote.dayVolume) : "—"} />
        </div>

        <div className="flex flex-1 flex-col">
          <ChartView symbol={symbol} initialTf={initialTf} />
        </div>
      </div>

      <div className="col-span-12 min-h-[400px] md:col-span-3">
        <OrderBookPanel symbol={symbol} tick={inst.tickSize} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "up" | "down";
}) {
  return (
    <div className="flex flex-col justify-center border-r border-mute-10 p-5 last:border-r-0">
      <div className="eyebrow">{label}</div>
      <div
        className={cn(
          "mt-1 font-sans text-[20px] font-medium tabnums tracking-crisp",
          tone === "up" && "text-accent",
          tone === "down" && "text-down",
        )}
      >
        {value}
      </div>
    </div>
  );
}

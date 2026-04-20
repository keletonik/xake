"use client";

import * as React from "react";
import Link from "next/link";
import useSWR from "swr";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Quote } from "@/lib/data-core/types";
import { cn, formatPercent, formatPrice } from "@/lib/utils";

type Watchlist = { id: string; name: string; symbols: string[] };

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function WatchlistManager() {
  const { data, mutate } = useSWR<{ watchlist: Watchlist }>("/api/v1/watchlists", fetcher);
  const [newSymbol, setNewSymbol] = React.useState("");
  const wl = data?.watchlist;

  const { data: quoteData } = useSWR<{ quotes: Quote[] }>(
    wl ? `/api/v1/quotes?symbols=${wl.symbols.join(",")}` : null,
    fetcher,
    { refreshInterval: 2_000 },
  );
  const quotes = Object.fromEntries((quoteData?.quotes ?? []).map((q) => [q.symbol, q]));

  async function patch(body: Record<string, unknown>) {
    const res = await fetch("/api/v1/watchlists", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) mutate();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-mute-10 px-6 py-4">
        <div>
          <div className="eyebrow">Watchlist</div>
          <div className="mt-1 font-sans text-[22px] font-medium tracking-crisp">
            {wl ? `${wl.name} · ${wl.symbols.length} symbols` : "Loading…"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
            placeholder="Add symbol"
            className="h-9 w-48"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newSymbol) {
                patch({ add: [newSymbol] });
                setNewSymbol("");
              }
            }}
          />
          <button
            onClick={() => {
              if (newSymbol) {
                patch({ add: [newSymbol] });
                setNewSymbol("");
              }
            }}
            className="flex h-9 items-center gap-1.5 bg-accent px-4 font-mono text-[10px] uppercase tracking-caps text-accent-ink"
          >
            <Plus className="size-3" /> Add
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto scrollbar-thin">
        <table className="w-full">
          <thead>
            <tr className="border-b border-mute-10">
              <th className="px-6 py-2 text-left font-mono text-[10px] uppercase tracking-caps text-mute-50">
                Symbol
              </th>
              <th className="px-4 py-2 text-right font-mono text-[10px] uppercase tracking-caps text-mute-50">
                Bid
              </th>
              <th className="px-4 py-2 text-right font-mono text-[10px] uppercase tracking-caps text-mute-50">
                Ask
              </th>
              <th className="px-4 py-2 text-right font-mono text-[10px] uppercase tracking-caps text-mute-50">
                Last
              </th>
              <th className="px-4 py-2 text-right font-mono text-[10px] uppercase tracking-caps text-mute-50">
                24h
              </th>
              <th className="px-6 py-2" />
            </tr>
          </thead>
          <tbody>
            {wl?.symbols.map((s) => {
              const q = quotes[s];
              const digits = q && q.ask > 1000 ? 2 : q && q.ask > 10 ? 2 : 4;
              const pct = q?.changePct ?? 0;
              return (
                <tr key={s} className="border-b border-mute-6 font-mono text-[11px] uppercase tracking-caps hover:bg-mute-4">
                  <td className="px-6 py-2">
                    <Link href={`/app/charts?symbol=${encodeURIComponent(s)}`} className="hover:text-accent">
                      {s}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-right tabnums text-mute-70">
                    {q ? formatPrice(q.bid, digits) : "—"}
                  </td>
                  <td className="px-4 py-2 text-right tabnums text-mute-70">
                    {q ? formatPrice(q.ask, digits) : "—"}
                  </td>
                  <td className="px-4 py-2 text-right tabnums text-fg">
                    {q ? formatPrice(q.last, digits) : "—"}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-2 text-right tabnums",
                      pct >= 0 ? "text-accent" : "text-down",
                    )}
                  >
                    {formatPercent(pct)}
                  </td>
                  <td className="px-6 py-2 text-right">
                    <button
                      aria-label={`Remove ${s}`}
                      onClick={() => patch({ remove: [s] })}
                      className="text-mute-50 hover:text-accent"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {!wl && (
              <tr>
                <td colSpan={6} className="p-10 text-center font-mono text-[11px] uppercase tracking-caps text-mute-50">
                  Loading watchlist…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

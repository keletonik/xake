"use client";

import * as React from "react";
import useSWR from "swr";
import type { OrderBook } from "@/lib/data-core/types";
import { cn, digitsForTick, formatPrice } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function OrderBookPanel({ symbol, tick = 0.01 }: { symbol: string; tick?: number }) {
  const { data } = useSWR<{ book: OrderBook }>(
    `/api/v1/orderbook?symbol=${encodeURIComponent(symbol)}&depth=15`,
    fetcher,
    { refreshInterval: 1_500 },
  );
  const book = data?.book;
  const digits = digitsForTick(tick);

  const { bids, asks, maxSize, spread, mid } = React.useMemo(() => {
    if (!book) return { bids: [], asks: [], maxSize: 1, spread: 0, mid: 0 };
    const maxB = book.bids.reduce((m, b) => Math.max(m, b.size), 0);
    const maxA = book.asks.reduce((m, a) => Math.max(m, a.size), 0);
    const best = book.bids[0]?.price ?? 0;
    const offer = book.asks[0]?.price ?? 0;
    return {
      bids: book.bids,
      asks: book.asks,
      maxSize: Math.max(maxB, maxA, 1),
      spread: offer && best ? offer - best : 0,
      mid: offer && best ? (offer + best) / 2 : 0,
    };
  }, [book]);

  return (
    <div className="flex min-h-0 flex-col border-l border-mute-10">
      <div className="flex items-center justify-between border-b border-mute-10 px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-caps text-mute-50">Orderbook</span>
        <span className="font-mono text-[10px] uppercase tracking-caps text-mute-50">
          Depth · 15
        </span>
      </div>
      <div className="grid grid-cols-3 border-b border-mute-10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-caps text-mute-40">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Sum</span>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin">
        {asks
          .slice()
          .reverse()
          .map((level, i) => {
            const cumulative = asks
              .slice(0, asks.length - i)
              .reduce((sum, l) => sum + l.size, 0);
            const widthPct = Math.min(100, (level.size / maxSize) * 100);
            return (
              <div key={`a${i}`} className="relative grid grid-cols-3 px-3 py-0.5 font-mono text-[11px] tabnums">
                <div
                  className="absolute inset-y-0 right-0 bg-down/15"
                  style={{ width: `${widthPct}%` }}
                  aria-hidden
                />
                <span className="relative text-down">{formatPrice(level.price, digits)}</span>
                <span className="relative text-right text-fg/70">{level.size.toFixed(4)}</span>
                <span className="relative text-right text-mute-40">
                  {cumulative.toFixed(4)}
                </span>
              </div>
            );
          })}

        <div className="border-y border-mute-10 bg-mute-2 px-3 py-1.5 text-center font-mono text-[11px] uppercase tracking-caps">
          <span className="text-fg tabnums">{formatPrice(mid, digits)}</span>
          <span className="ml-3 text-mute-40">Spread</span>
          <span className="ml-1 text-accent tabnums">{formatPrice(spread, digits)}</span>
        </div>

        {bids.map((level, i) => {
          const cumulative = bids.slice(0, i + 1).reduce((sum, l) => sum + l.size, 0);
          const widthPct = Math.min(100, (level.size / maxSize) * 100);
          return (
            <div key={`b${i}`} className="relative grid grid-cols-3 px-3 py-0.5 font-mono text-[11px] tabnums">
              <div
                className="absolute inset-y-0 right-0 bg-accent/15"
                style={{ width: `${widthPct}%` }}
                aria-hidden
              />
              <span className="relative text-accent">{formatPrice(level.price, digits)}</span>
              <span className="relative text-right text-fg/70">{level.size.toFixed(4)}</span>
              <span className="relative text-right text-mute-40">{cumulative.toFixed(4)}</span>
            </div>
          );
        })}

        {!book && (
          <div className={cn("p-6 text-center font-mono text-[11px] uppercase tracking-caps text-mute-50")}>
            Loading book…
          </div>
        )}
      </div>
    </div>
  );
}

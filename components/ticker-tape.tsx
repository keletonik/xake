"use client";

import * as React from "react";
import useSWR from "swr";
import { cn, formatPercent, formatPrice } from "@/lib/utils";
import type { Quote } from "@/lib/data-core/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function TickerTape({ symbols }: { symbols: string[] }) {
  const key = `/api/v1/quotes?symbols=${symbols.join(",")}`;
  const { data } = useSWR<{ quotes: Quote[] }>(key, fetcher, { refreshInterval: 2_000 });
  const prev = React.useRef<Record<string, number>>({});

  const quotes = data?.quotes ?? [];

  return (
    <div className="flex h-9 shrink-0 items-stretch overflow-x-auto border-b border-mute-10 scrollbar-thin">
      {quotes.length === 0 && (
        <span className="flex items-center px-4 font-mono text-[10px] uppercase tracking-caps text-mute-40">
          Awaiting quotes…
        </span>
      )}
      {quotes.map((q) => {
        const last = q.last;
        const prior = prev.current[q.symbol];
        const tickDir = prior === undefined ? 0 : last - prior;
        prev.current[q.symbol] = last;
        const digits = q.ask > 1000 ? 2 : q.ask > 10 ? 2 : 4;
        const up = q.changePct >= 0;
        return (
          <div
            key={q.symbol}
            className={cn(
              "flex shrink-0 items-center gap-3 border-r border-mute-8 px-4 font-mono text-[11px] uppercase tracking-caps transition-colors",
              tickDir > 0 && "bg-accent/10",
              tickDir < 0 && "bg-mute-8",
            )}
          >
            <span className="text-fg">{q.symbol}</span>
            <span className="text-fg tabnums">{formatPrice(last, digits)}</span>
            <span className={cn("tabnums", up ? "text-accent" : "text-down")}>
              {up ? "▲" : "▼"} {formatPercent(q.changePct)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

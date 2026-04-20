"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { AssetClass } from "@/lib/data-core/types";
import { cn, digitsForTick, formatCompact, formatPercent, formatPrice } from "@/lib/utils";

type Row = {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  venue: string;
  tickSize: number;
  session: string;
  marginFactor: number;
  bid: number | null;
  ask: number | null;
  last: number | null;
  changePct: number;
  dayHigh: number | null;
  dayLow: number | null;
  dayVolume: number;
};

const CLASS_LABELS: Record<AssetClass, string> = {
  crypto: "Crypto",
  equity: "Equities",
  fx: "FX",
  index: "Indices",
  future: "Futures",
  commodity: "Commodities",
  option: "Options",
};

const CLASSES: AssetClass[] = [
  "crypto",
  "equity",
  "index",
  "fx",
  "future",
  "commodity",
  "option",
];

export function MarketExplorer({ rows }: { rows: Row[] }) {
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<AssetClass | "all">("all");
  const [sortBy, setSortBy] = React.useState<"changePct" | "symbol" | "dayVolume" | "last">("changePct");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    let next = rows.filter((r) => {
      if (filter !== "all" && r.assetClass !== filter) return false;
      if (!needle) return true;
      return (
        r.symbol.toLowerCase().includes(needle) ||
        r.name.toLowerCase().includes(needle) ||
        r.venue.toLowerCase().includes(needle)
      );
    });
    next = next.slice().sort((a, b) => {
      const va = a[sortBy] ?? 0;
      const vb = b[sortBy] ?? 0;
      if (typeof va === "string" && typeof vb === "string") {
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      const n = Number(va) - Number(vb);
      return sortDir === "asc" ? n : -n;
    });
    return next;
  }, [rows, filter, query, sortBy, sortDir]);

  function toggleSort(key: typeof sortBy) {
    if (key === sortBy) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortDir("desc");
    }
  }

  const countByClass = React.useMemo(() => {
    const out: Record<string, number> = { all: rows.length };
    for (const r of rows) out[r.assetClass] = (out[r.assetClass] ?? 0) + 1;
    return out;
  }, [rows]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-mute-10 px-6 py-4">
        <div>
          <div className="eyebrow">Market explorer</div>
          <div className="mt-1 font-sans text-[20px] font-medium tracking-crisp">
            {filtered.length} of {rows.length} instruments
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border border-mute-20 px-3">
            <Search className="size-3.5 text-mute-40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search symbol or name…"
              className="h-9 w-64 bg-transparent font-mono text-[11px] uppercase tracking-caps placeholder:text-mute-40 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 border-b border-mute-10 px-6 py-2">
        <FilterChip
          label={`All · ${countByClass.all}`}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        {CLASSES.map((c) => (
          <FilterChip
            key={c}
            label={`${CLASS_LABELS[c]} · ${countByClass[c] ?? 0}`}
            active={filter === c}
            onClick={() => setFilter(c)}
          />
        ))}
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin">
        <table className="w-full">
          <thead className="sticky top-0 bg-bg">
            <tr className="border-b border-mute-10">
              <Th label="Symbol" onClick={() => toggleSort("symbol")} active={sortBy === "symbol"} dir={sortDir} />
              <Th label="Name" />
              <Th label="Class" />
              <Th label="Venue" />
              <Th label="Bid" align="right" />
              <Th label="Ask" align="right" />
              <Th label="Last" onClick={() => toggleSort("last")} active={sortBy === "last"} dir={sortDir} align="right" />
              <Th label="Change" onClick={() => toggleSort("changePct")} active={sortBy === "changePct"} dir={sortDir} align="right" />
              <Th label="Day High" align="right" />
              <Th label="Day Low" align="right" />
              <Th label="Volume" onClick={() => toggleSort("dayVolume")} active={sortBy === "dayVolume"} dir={sortDir} align="right" />
              <Th label="" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const digits = digitsForTick(r.tickSize);
              return (
                <tr
                  key={r.symbol}
                  className="border-b border-mute-6 font-mono text-[11px] uppercase tracking-caps hover:bg-mute-4"
                >
                  <Td>
                    <Link href={`/app/charts?symbol=${encodeURIComponent(r.symbol)}`} className="text-fg hover:text-accent">
                      {r.symbol}
                    </Link>
                  </Td>
                  <Td className="normal-case text-mute-70">{r.name}</Td>
                  <Td className="text-mute-50">{CLASS_LABELS[r.assetClass]}</Td>
                  <Td className="text-mute-50">{r.venue}</Td>
                  <Td align="right">{r.bid !== null ? formatPrice(r.bid, digits) : "—"}</Td>
                  <Td align="right">{r.ask !== null ? formatPrice(r.ask, digits) : "—"}</Td>
                  <Td align="right" className="text-fg tabnums">
                    {r.last !== null ? formatPrice(r.last, digits) : "—"}
                  </Td>
                  <Td align="right" className={cn("tabnums", r.changePct >= 0 ? "text-accent" : "text-down")}>
                    {formatPercent(r.changePct)}
                  </Td>
                  <Td align="right" className="text-mute-50 tabnums">
                    {r.dayHigh !== null ? formatPrice(r.dayHigh, digits) : "—"}
                  </Td>
                  <Td align="right" className="text-mute-50 tabnums">
                    {r.dayLow !== null ? formatPrice(r.dayLow, digits) : "—"}
                  </Td>
                  <Td align="right" className="text-mute-50">{formatCompact(r.dayVolume)}</Td>
                  <Td align="right">
                    <Link href={`/app/charts?symbol=${encodeURIComponent(r.symbol)}`} className="text-accent">
                      Chart →
                    </Link>
                  </Td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={12} className="p-12 text-center font-mono text-[11px] uppercase tracking-caps text-mute-50">
                  No instruments match that filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "border px-3 py-1 font-mono text-[10px] uppercase tracking-caps transition-colors",
        active
          ? "border-accent bg-accent text-accent-ink"
          : "border-mute-10 text-mute-70 hover:border-accent hover:text-accent",
      )}
    >
      {label}
    </button>
  );
}

function Th({
  label,
  align = "left",
  onClick,
  active,
  dir,
}: {
  label: string;
  align?: "left" | "right";
  onClick?: () => void;
  active?: boolean;
  dir?: "asc" | "desc";
}) {
  const arrow = active ? (dir === "asc" ? "↑" : "↓") : "";
  return (
    <th
      onClick={onClick}
      className={cn(
        "whitespace-nowrap px-4 py-2 font-mono text-[10px] uppercase tracking-caps text-mute-50",
        align === "right" ? "text-right" : "text-left",
        onClick && "cursor-pointer hover:text-fg",
        active && "text-fg",
      )}
    >
      {label} {arrow}
    </th>
  );
}

function Td({
  children,
  align = "left",
  className,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td
      className={cn(
        "whitespace-nowrap px-4 py-2",
        align === "right" ? "text-right" : "text-left",
        className,
      )}
    >
      {children}
    </td>
  );
}

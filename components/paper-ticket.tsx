"use client";

import * as React from "react";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import type { Quote } from "@/lib/data-core/types";
import { cn, formatPrice, formatUsd } from "@/lib/utils";

type OrderRow = {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  type: "market" | "limit";
  qty: number;
  avgFillPrice: number;
  status: string;
  createdAt: number;
  reason?: string;
};
type OrdersData = {
  orders: OrderRow[];
  fills: Array<{
    id: string;
    symbol: string;
    side: "buy" | "sell";
    qty: number;
    price: number;
    ts: number;
  }>;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function PaperTicket() {
  const [symbol, setSymbol] = React.useState("BTC-USD");
  const [side, setSide] = React.useState<"buy" | "sell">("buy");
  const [type, setType] = React.useState<"market" | "limit">("market");
  const [qty, setQty] = React.useState("0.01");
  const [limitPrice, setLimitPrice] = React.useState("");
  const [result, setResult] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  const { data: quoteData } = useSWR<{ quotes: Quote[] }>(
    `/api/v1/quotes?symbols=${encodeURIComponent(symbol)}`,
    fetcher,
    { refreshInterval: 2_000 },
  );
  const q = quoteData?.quotes[0];

  const { data: orderData, mutate: mutateOrders } = useSWR<OrdersData>("/api/v1/orders", fetcher, {
    refreshInterval: 5_000,
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setResult(null);
    const qtyNum = Number(qty);
    if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
      setErr("Qty must be greater than zero.");
      return;
    }
    const body: Record<string, unknown> = { symbol, side, type, qty: qtyNum, tif: "gtc" };
    if (type === "limit") body.limitPrice = Number(limitPrice);
    const res = await fetch("/api/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(json.reason ?? "Rejected.");
    } else {
      setResult(
        json.order?.status === "filled"
          ? `Filled ${qty} @ ${formatPrice(json.order.avgFillPrice)}`
          : `Order ${json.order?.status ?? "accepted"}`,
      );
    }
    mutateOrders();
  }

  const est = q ? (Number(qty) || 0) * (side === "buy" ? q.ask : q.bid) : 0;

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[360px_1fr]">
      <Panel eyebrow="Paper" title="Order ticket" className="border-b border-mute-10 md:border-b-0 md:border-r">
        <form className="flex flex-col gap-4 p-5" onSubmit={submit}>
          <label className="flex flex-col gap-1.5">
            <span className="eyebrow">Symbol</span>
            <Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} />
          </label>

          <div className="grid grid-cols-2 gap-px bg-mute-10 font-mono text-[10px] uppercase tracking-caps">
            <div className="bg-bg p-3">
              <div className="text-mute-50">Bid</div>
              <div className="mt-1 text-fg tabnums">{q ? formatPrice(q.bid) : "—"}</div>
            </div>
            <div className="bg-bg p-3">
              <div className="text-mute-50">Ask</div>
              <div className="mt-1 text-fg tabnums">{q ? formatPrice(q.ask) : "—"}</div>
            </div>
          </div>

          <div>
            <span className="eyebrow">Side</span>
            <div className="mt-1.5 grid grid-cols-2">
              <button
                type="button"
                onClick={() => setSide("buy")}
                className={cn(
                  "h-10 border font-mono text-[11px] uppercase tracking-caps",
                  side === "buy"
                    ? "border-accent bg-accent text-accent-ink"
                    : "border-mute-20 text-fg/60 hover:text-fg",
                )}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => setSide("sell")}
                className={cn(
                  "h-10 border border-l-0 font-mono text-[11px] uppercase tracking-caps",
                  side === "sell"
                    ? "border-fg bg-fg text-bg"
                    : "border-mute-20 text-fg/60 hover:text-fg",
                )}
              >
                Sell
              </button>
            </div>
          </div>

          <div>
            <span className="eyebrow">Type</span>
            <div className="mt-1.5 grid grid-cols-2">
              {(["market", "limit"] as const).map((t, i) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "h-9 border font-mono text-[10px] uppercase tracking-caps",
                    i > 0 && "border-l-0",
                    type === t
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-mute-20 text-mute-50 hover:text-fg",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="eyebrow">Quantity</span>
            <Input type="number" step="any" value={qty} onChange={(e) => setQty(e.target.value)} />
          </label>

          {type === "limit" && (
            <label className="flex flex-col gap-1.5">
              <span className="eyebrow">Limit price</span>
              <Input
                type="number"
                step="any"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
              />
            </label>
          )}

          <div className="flex items-baseline justify-between border-t border-mute-10 pt-3 font-mono text-[11px] uppercase tracking-caps">
            <span className="text-mute-50">Est. notional</span>
            <span className="text-fg tabnums">{formatUsd(est)}</span>
          </div>

          <button
            type="submit"
            className="h-12 bg-accent font-mono text-[12px] uppercase tracking-caps text-accent-ink hover:bg-accent/90"
          >
            Execute (paper)
          </button>

          {err && <div className="font-mono text-[10px] uppercase tracking-caps text-accent">{err}</div>}
          {result && <div className="font-mono text-[10px] uppercase tracking-caps text-fg">{result}</div>}

          <div className="font-mono text-[9px] uppercase tracking-caps text-mute-40">
            Short-selling blocked · 2 bps slippage · Paper only
          </div>
        </form>
      </Panel>

      <Panel eyebrow="History" title="Recent orders">
        <div className="overflow-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr className="border-b border-mute-10">
                <Th>Time</Th>
                <Th>Symbol</Th>
                <Th>Side</Th>
                <Th>Type</Th>
                <Th align="right">Qty</Th>
                <Th align="right">Avg Fill</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {(orderData?.orders ?? []).map((o) => (
                <tr key={o.id} className="border-b border-mute-6 font-mono text-[11px] uppercase tracking-caps">
                  <Td className="text-mute-50">{new Date(o.createdAt).toLocaleTimeString()}</Td>
                  <Td>{o.symbol}</Td>
                  <Td>
                    <Badge variant={o.side === "buy" ? "up" : "down"} size="xs">
                      {o.side}
                    </Badge>
                  </Td>
                  <Td className="text-mute-70">{o.type}</Td>
                  <Td align="right" className="tabnums">{o.qty}</Td>
                  <Td align="right" className="tabnums text-fg">
                    {o.avgFillPrice ? formatUsd(o.avgFillPrice) : "—"}
                  </Td>
                  <Td>
                    <Badge variant={o.status === "filled" ? "accent" : "mute"} size="xs">
                      {o.status}
                    </Badge>
                  </Td>
                </tr>
              ))}
              {(orderData?.orders ?? []).length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center font-mono text-[11px] uppercase tracking-caps text-mute-50">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className={cn(
        "whitespace-nowrap px-4 py-2 font-mono text-[10px] uppercase tracking-caps text-mute-50",
        align === "right" ? "text-right" : "text-left",
      )}
    >
      {children}
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
    <td className={cn("px-4 py-2", align === "right" ? "text-right" : "text-left", className)}>
      {children}
    </td>
  );
}

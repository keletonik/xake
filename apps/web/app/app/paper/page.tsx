"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardMeta,
  CardTitle,
  EnvBadge,
  Input,
  Panel,
  SectionHeader,
  Separator
} from "@xake/ui";
import type { OrderDraft } from "@xake/trading-core";
import { OrderDraftSchema } from "@xake/trading-core";
import { api } from "../../../lib/api-client";
import { useQuoteStream } from "../../../lib/use-quote-stream";

type OrderType = "market" | "limit";

export default function PaperTicketPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [type, setType] = useState<OrderType>("market");
  const [quantity, setQuantity] = useState("10");
  const [limitPrice, setLimitPrice] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { quotes } = useQuoteStream([symbol]);
  const q = quotes[symbol];
  const notional = (Number(quantity) || 0) * (q?.last ?? 0);

  const submit = async () => {
    setResult(null);
    setError(null);
    const draft: OrderDraft = {
      symbol: symbol.toUpperCase(),
      side,
      type,
      quantity: Number(quantity),
      limitPrice: type === "limit" ? Number(limitPrice) : undefined,
      tif: "day",
      env: "paper"
    };
    const parsed = OrderDraftSchema.safeParse(draft);
    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => i.message).join("; "));
      return;
    }
    try {
      const r = await api.post<{ order: { id: string; status: string }; fills: unknown[] }>("/v1/orders", parsed.data);
      setResult(`Order ${r.order.id} · ${r.order.status} · ${r.fills.length} fill(s)`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order failed");
    }
  };

  return (
    <>
      <SectionHeader
        eyebrow="Workspace"
        title="Paper ticket"
        description="Submit paper orders. Execution is simulated against the streamed mid-price with configurable slippage. Live trading is explicitly disabled server-side."
        actions={<EnvBadge env="paper" />}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "var(--space-4)" }}>
        <Panel title="Order ticket">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span className="xake-micro-label">Symbol</span>
              <Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span className="xake-micro-label">Quantity</span>
              <Input variant="mono" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span className="xake-micro-label">Side</span>
              <div style={{ display: "inline-flex", gap: 6 }}>
                <Button variant={side === "buy" ? "primary" : "secondary"} onClick={() => setSide("buy")} size="sm">
                  Buy
                </Button>
                <Button variant={side === "sell" ? "danger" : "secondary"} onClick={() => setSide("sell")} size="sm">
                  Sell
                </Button>
              </div>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span className="xake-micro-label">Type</span>
              <div style={{ display: "inline-flex", gap: 6 }}>
                <Button variant={type === "market" ? "secondary" : "ghost"} onClick={() => setType("market")} size="sm">
                  Market
                </Button>
                <Button variant={type === "limit" ? "secondary" : "ghost"} onClick={() => setType("limit")} size="sm">
                  Limit
                </Button>
              </div>
            </label>
            {type === "limit" ? (
              <label style={{ display: "flex", flexDirection: "column", gap: 4, gridColumn: "1 / -1" }}>
                <span className="xake-micro-label">Limit price</span>
                <Input variant="mono" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} />
              </label>
            ) : null}
          </div>

          <Separator />

          <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "center" }}>
            <Badge tone="warning">Paper only</Badge>
            <span style={{ color: "var(--colour-text-secondary)", fontSize: "var(--text-dense)" }}>
              Notional ≈ <span className="xake-numeric">${notional.toFixed(2)}</span>
            </span>
            <Button variant="primary" onClick={() => void submit()} style={{ marginLeft: "auto" }}>
              Submit paper order
            </Button>
          </div>

          {result ? (
            <p style={{ color: "var(--colour-positive)", fontSize: "var(--text-dense)" }}>{result}</p>
          ) : null}
          {error ? (
            <p style={{ color: "var(--colour-negative)", fontSize: "var(--text-dense)" }}>{error}</p>
          ) : null}
        </Panel>

        <Panel title={`${symbol} · context`}>
          <div style={{ display: "grid", gap: "var(--space-3)" }}>
            <Card>
              <CardMeta>Last</CardMeta>
              <CardTitle>
                <span className="xake-numeric">{q ? q.last.toFixed(2) : "—"}</span>
              </CardTitle>
              <CardDescription>
                {q?.changePct !== undefined ? (
                  <span className="xake-numeric" style={{ color: q.changePct >= 0 ? "var(--colour-positive)" : "var(--colour-negative)" }}>
                    {q.changePct >= 0 ? "+" : ""}
                    {q.changePct.toFixed(2)}%
                  </span>
                ) : "—"}
              </CardDescription>
            </Card>
            <Card>
              <CardMeta>Bid / Ask</CardMeta>
              <CardTitle>
                <span className="xake-numeric">
                  {q?.bid?.toFixed(2) ?? "—"} / {q?.ask?.toFixed(2) ?? "—"}
                </span>
              </CardTitle>
              <CardDescription>Spread {q?.bid && q?.ask ? (q.ask - q.bid).toFixed(4) : "—"}</CardDescription>
            </Card>
            <Card>
              <CardMeta>Source</CardMeta>
              <CardTitle>
                <Badge tone={q?.attribution.feedClass === "mock" ? "warning" : "positive"}>
                  {q?.attribution.source ?? "—"}
                </Badge>
              </CardTitle>
              <CardDescription>Feed {q?.attribution.feedClass ?? "—"}</CardDescription>
            </Card>
          </div>
        </Panel>
      </div>
    </>
  );
}

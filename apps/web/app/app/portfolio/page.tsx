"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardMeta,
  CardTitle,
  EmptyState,
  Panel,
  SectionHeader,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@xake/ui";
import type { Fill, Order, PortfolioSnapshot } from "@xake/trading-core";
import { api } from "../../../lib/api-client";

export default function PortfolioPage() {
  const [p, setP] = useState<PortfolioSnapshot | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [fills, setFills] = useState<Fill[]>([]);
  const [resetting, setResetting] = useState(false);

  const load = async () => {
    const [snap, activity] = await Promise.all([
      api.get<PortfolioSnapshot>("/v1/portfolio"),
      api.get<{ orders: Order[]; fills: Fill[] }>("/v1/portfolio/activity")
    ]);
    setP(snap);
    setOrders(activity.orders);
    setFills(activity.fills);
  };

  useEffect(() => {
    void load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  const reset = async () => {
    if (!confirm("Reset paper balance, positions, and history?")) return;
    setResetting(true);
    try {
      await api.post("/v1/portfolio/reset");
      await load();
    } finally {
      setResetting(false);
    }
  };

  const allocation = p?.positions.filter((x) => x.quantity !== 0) ?? [];

  return (
    <>
      <SectionHeader
        eyebrow="Workspace"
        title="Portfolio"
        description="Paper account view. Positions, average cost, realised/unrealised P&L, order history, and the transaction ledger."
        actions={
          <Button variant="danger" onClick={() => void reset()} disabled={resetting}>
            Reset paper
          </Button>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-3)" }}>
        <Card>
          <CardMeta>Equity</CardMeta>
          <CardTitle>
            <span className="xake-numeric">
              {p ? p.totalEquity.toLocaleString(undefined, { style: "currency", currency: p.balance.currency }) : "—"}
            </span>
          </CardTitle>
          <CardDescription>Cash + market value</CardDescription>
        </Card>
        <Card>
          <CardMeta>Cash</CardMeta>
          <CardTitle>
            <span className="xake-numeric">
              {p ? p.balance.cash.toLocaleString(undefined, { style: "currency", currency: p.balance.currency }) : "—"}
            </span>
          </CardTitle>
          <CardDescription>Buying power</CardDescription>
        </Card>
        <Card>
          <CardMeta>Realised P&amp;L</CardMeta>
          <CardTitle>
            <span
              className="xake-numeric"
              style={{ color: (p?.totalRealisedPnl ?? 0) >= 0 ? "var(--colour-positive)" : "var(--colour-negative)" }}
            >
              {p ? p.totalRealisedPnl.toFixed(2) : "—"}
            </span>
          </CardTitle>
          <CardDescription>Session-to-date</CardDescription>
        </Card>
        <Card>
          <CardMeta>Unrealised P&amp;L</CardMeta>
          <CardTitle>
            <span
              className="xake-numeric"
              style={{ color: (p?.totalUnrealisedPnl ?? 0) >= 0 ? "var(--colour-positive)" : "var(--colour-negative)" }}
            >
              {p ? p.totalUnrealisedPnl.toFixed(2) : "—"}
            </span>
          </CardTitle>
          <CardDescription>Priced from last streamed quote</CardDescription>
        </Card>
      </div>

      <Panel title="Positions">
        {allocation.length === 0 ? (
          <EmptyState title="No open positions" description="Submit a paper order to get started." />
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            {allocation.map((pos) => (
              <div
                key={pos.symbol}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
                  gap: 12,
                  padding: "10px 12px",
                  background: "var(--colour-bg-raised)",
                  border: "1px solid var(--colour-border)",
                  borderRadius: "var(--radius-md)"
                }}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{pos.symbol}</span>
                <span className="xake-numeric" style={{ textAlign: "right" }}>{pos.quantity}</span>
                <span className="xake-numeric" style={{ textAlign: "right" }}>avg {pos.averageCost.toFixed(4)}</span>
                <span className="xake-numeric" style={{ textAlign: "right" }}>last {pos.lastPrice?.toFixed(4) ?? "—"}</span>
                <span
                  className="xake-numeric"
                  style={{ textAlign: "right", color: (pos.unrealisedPnl ?? 0) >= 0 ? "var(--colour-positive)" : "var(--colour-negative)" }}
                >
                  {pos.unrealisedPnl?.toFixed(2) ?? "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="fills">Fills / ledger</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          {orders.length === 0 ? (
            <EmptyState title="No orders yet" description="Place a paper order from the paper ticket or a draft." />
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              {orders.map((o) => (
                <div
                  key={o.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
                    gap: 12,
                    padding: "10px 12px",
                    background: "var(--colour-bg-raised)",
                    border: "1px solid var(--colour-border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "var(--text-dense)"
                  }}
                >
                  <span style={{ fontFamily: "var(--font-mono)" }}>{o.symbol}</span>
                  <span>{o.side.toUpperCase()}</span>
                  <span>{o.type}</span>
                  <span className="xake-numeric">{o.quantity}</span>
                  <Badge tone={statusTone(o.status)}>{o.status}</Badge>
                  <span className="xake-micro-label" style={{ textAlign: "right" }}>
                    {new Date(o.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="fills">
          {fills.length === 0 ? (
            <EmptyState title="No fills yet" description="Each execution posts here." />
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              {fills.map((f) => (
                <div
                  key={f.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
                    gap: 12,
                    padding: "10px 12px",
                    background: "var(--colour-bg-raised)",
                    border: "1px solid var(--colour-border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "var(--text-dense)"
                  }}
                >
                  <span style={{ fontFamily: "var(--font-mono)" }}>{f.symbol}</span>
                  <span>{f.side.toUpperCase()}</span>
                  <span className="xake-numeric">{f.quantity}</span>
                  <span className="xake-numeric">@ {f.price.toFixed(4)}</span>
                  <span className="xake-micro-label" style={{ textAlign: "right" }}>
                    {new Date(f.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      <Separator />
      <span className="xake-micro-label">Equity curve chart renders in Stage 7 — snapshot metrics above remain the source of truth.</span>
    </>
  );
}

const statusTone = (s: Order["status"]): "neutral" | "positive" | "negative" | "warning" | "info" | "accent" => {
  switch (s) {
    case "filled":
      return "positive";
    case "rejected":
      return "negative";
    case "cancelled":
      return "neutral";
    case "accepted":
      return "info";
    case "partial":
      return "warning";
    case "submitted":
    case "draft":
      return "accent";
  }
};

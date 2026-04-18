"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Panel,
  SectionHeader,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@xake/ui";
import type { Alert, AlertDraft, AlertEvent } from "@xake/trading-core";
import { api } from "../../../lib/api-client";

type Kind = "price_above" | "price_below" | "pct_move";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [history, setHistory] = useState<AlertEvent[]>([]);
  const [kind, setKind] = useState<Kind>("price_above");
  const [symbol, setSymbol] = useState("AAPL");
  const [threshold, setThreshold] = useState("230");
  const [percent, setPercent] = useState("2");
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    const [a, h] = await Promise.all([
      api.get<{ items: Alert[] }>("/v1/alerts"),
      api.get<{ items: AlertEvent[] }>("/v1/alerts/history")
    ]);
    setAlerts(a.items);
    setHistory(h.items);
  };

  useEffect(() => {
    void load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  const create = async () => {
    setErr(null);
    const draft: AlertDraft =
      kind === "pct_move"
        ? {
            name: `${symbol} ${percent}% move`,
            condition: { kind: "pct_move", symbol, percent: Number(percent), direction: "any" },
            channels: ["in_app"],
            cooldownSeconds: 300
          }
        : {
            name: `${symbol} ${kind.replace("_", " ")} ${threshold}`,
            condition: { kind, symbol, threshold: Number(threshold) },
            channels: ["in_app"],
            cooldownSeconds: 300
          };
    try {
      await api.post("/v1/alerts", draft);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  };

  const toggle = async (id: string, active: boolean) => {
    await api.patch(`/v1/alerts/${id}`, { active });
    await load();
  };

  const remove = async (id: string) => {
    await api.del(`/v1/alerts/${id}`);
    await load();
  };

  return (
    <>
      <SectionHeader
        eyebrow="Workspace"
        title="Alerts"
        description="Price and percentage-move triggers with duplicate prevention and cooldowns. Assistant alert drafts surface here for your confirmation."
      />

      <Panel title="New alert">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-3)", alignItems: "end" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "var(--text-dense)" }}>
            <span className="xake-micro-label">Kind</span>
            <select
              className="xake-input"
              value={kind}
              onChange={(e) => setKind(e.target.value as Kind)}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <option value="price_above">price above</option>
              <option value="price_below">price below</option>
              <option value="pct_move">% move</option>
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "var(--text-dense)" }}>
            <span className="xake-micro-label">Symbol</span>
            <Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} />
          </label>
          {kind !== "pct_move" ? (
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "var(--text-dense)" }}>
              <span className="xake-micro-label">Threshold</span>
              <Input variant="mono" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
            </label>
          ) : (
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "var(--text-dense)" }}>
              <span className="xake-micro-label">% move</span>
              <Input variant="mono" value={percent} onChange={(e) => setPercent(e.target.value)} />
            </label>
          )}
          <Button variant="primary" onClick={() => void create()}>Create</Button>
        </div>
        {err ? <p style={{ color: "var(--colour-negative)", fontSize: "var(--text-dense)", marginTop: 8 }}>{err}</p> : null}
      </Panel>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <AlertList alerts={alerts.filter((a) => a.active)} onToggle={toggle} onRemove={remove} />
        </TabsContent>
        <TabsContent value="all">
          <AlertList alerts={alerts} onToggle={toggle} onRemove={remove} />
        </TabsContent>
        <TabsContent value="history">
          <HistoryList events={history} />
        </TabsContent>
      </Tabs>
    </>
  );
}

function AlertList({
  alerts,
  onToggle,
  onRemove
}: {
  alerts: Alert[];
  onToggle: (id: string, active: boolean) => void;
  onRemove: (id: string) => void;
}) {
  if (alerts.length === 0) return <EmptyState title="No alerts" description="Create one above. Duplicates on the same condition are rejected automatically." />;
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {alerts.map((a) => (
        <div
          key={a.id}
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr auto",
            gap: 12,
            alignItems: "center",
            padding: "10px 12px",
            background: "var(--colour-bg-raised)",
            border: "1px solid var(--colour-border)",
            borderRadius: "var(--radius-md)"
          }}
        >
          <div>
            <div style={{ fontWeight: 500 }}>{a.name}</div>
            <div style={{ fontSize: "var(--text-dense)", color: "var(--colour-text-muted)" }}>
              {a.condition.kind} · cooldown {a.cooldownSeconds}s
            </div>
          </div>
          <Badge tone={a.active ? "positive" : "neutral"} dot>
            {a.active ? "active" : "paused"}
          </Badge>
          <span className="xake-micro-label">
            last fired {a.lastFiredAt ? new Date(a.lastFiredAt).toLocaleTimeString() : "—"}
          </span>
          <div style={{ display: "inline-flex", gap: 4 }}>
            <Button size="sm" variant="ghost" onClick={() => onToggle(a.id, !a.active)}>
              {a.active ? "Pause" : "Resume"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onRemove(a.id)}>
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function HistoryList({ events }: { events: AlertEvent[] }) {
  if (events.length === 0) return <EmptyState title="No alert events yet" description="Events appear here as your conditions fire." />;
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {events.map((e) => (
        <div
          key={e.id}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            padding: "8px 12px",
            background: "var(--colour-bg-raised)",
            border: "1px solid var(--colour-border)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-dense)"
          }}
        >
          <span style={{ fontFamily: "var(--font-mono)" }}>{e.symbol}</span>
          <span className="xake-numeric">{e.triggerPrice.toFixed(4)}</span>
          <span className="xake-micro-label" style={{ textAlign: "right" }}>
            {new Date(e.firedAt).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

"use client";

import * as React from "react";
import useSWR from "swr";
import { Bell, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";

type Alert = {
  id: string;
  name: string;
  enabled: boolean;
  firedCount: number;
  condition:
    | { kind: "price"; symbol: string; op: "gt" | "lt"; value: number }
    | { kind: "percent_move"; symbol: string; windowMinutes: number; thresholdPct: number };
  cooldownMinutes: number;
};

type Firing = { id: string; alertId: string; firedAt: number; reason: string };

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function AlertManager() {
  const { data, mutate } = useSWR<{ alerts: Alert[]; firings: Firing[] }>(
    "/api/v1/alerts",
    fetcher,
    { refreshInterval: 5_000 },
  );

  const [name, setName] = React.useState("BTC breakout");
  const [symbol, setSymbol] = React.useState("BTC-USD");
  const [op, setOp] = React.useState<"gt" | "lt">("gt");
  const [value, setValue] = React.useState("100000");
  const [cooldown, setCooldown] = React.useState("5");
  const [err, setErr] = React.useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const num = Number(value);
    if (!Number.isFinite(num)) {
      setErr("Price must be a number.");
      return;
    }
    const res = await fetch("/api/v1/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        cooldownMinutes: Number(cooldown) || 5,
        condition: { kind: "price", symbol, op, value: num },
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setErr(body.error === "duplicate_condition" ? "Duplicate alert." : "Failed to save.");
      return;
    }
    mutate();
  }

  async function remove(id: string) {
    await fetch(`/api/v1/alerts?id=${id}`, { method: "DELETE" });
    mutate();
  }

  const alerts = data?.alerts ?? [];
  const firings = data?.firings ?? [];

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 md:grid-cols-2">
      <Panel
        eyebrow="Create"
        title="Price alert"
        className="border-b border-mute-10 md:border-b-0 md:border-r"
      >
        <form className="flex flex-col gap-3 p-5" onSubmit={create}>
          <label className="flex flex-col gap-1.5">
            <span className="eyebrow">Name</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <div className="grid grid-cols-[1fr_80px] gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="eyebrow">Symbol</span>
              <Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="eyebrow">Op</span>
              <select
                value={op}
                onChange={(e) => setOp(e.target.value as "gt" | "lt")}
                className="h-9 border border-mute-20 bg-transparent px-2 font-mono text-[12px] focus:border-accent focus:outline-none"
              >
                <option value="gt">&gt; greater</option>
                <option value="lt">&lt; less</option>
              </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="eyebrow">Threshold</span>
              <Input type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="eyebrow">Cooldown (min)</span>
              <Input type="number" min="0" value={cooldown} onChange={(e) => setCooldown(e.target.value)} />
            </label>
          </div>
          {err && <div className="font-mono text-[10px] uppercase tracking-caps text-accent">{err}</div>}
          <button
            type="submit"
            className="flex h-10 items-center justify-center gap-2 bg-accent font-mono text-[11px] uppercase tracking-caps text-accent-ink hover:bg-accent/90"
          >
            <Bell className="size-3.5" /> Create alert
          </button>
        </form>

        <div className="border-t border-mute-10">
          {alerts.length === 0 ? (
            <EmptyState
              title="No alerts yet"
              description="Create a price alert above. The evaluator runs every five minutes."
            />
          ) : (
            <ul>
              {alerts.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between border-b border-mute-6 px-5 py-3"
                >
                  <div>
                    <div className="font-sans text-[14px] font-medium tracking-crisp">{a.name}</div>
                    <div className="mt-0.5 font-mono text-[10px] uppercase tracking-caps text-mute-50">
                      {a.condition.kind === "price"
                        ? `${a.condition.symbol} ${a.condition.op === "gt" ? ">" : "<"} ${a.condition.value}`
                        : `${a.condition.symbol} %MOVE ${a.condition.thresholdPct}% / ${a.condition.windowMinutes}M`}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={a.firedCount ? "accent" : "mute"}>
                      Fired {a.firedCount}
                    </Badge>
                    <button
                      aria-label="Delete"
                      className="text-mute-50 hover:text-accent"
                      onClick={() => remove(a.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Panel>

      <Panel eyebrow="Log" title="Recent firings · last 50">
        {firings.length === 0 ? (
          <EmptyState
            title="No firings yet"
            description="When an alert crosses its threshold it lands here, most recent first."
          />
        ) : (
          <ul>
            {firings.map((f) => (
              <li key={f.id} className="border-b border-mute-6 px-5 py-3">
                <div className="font-mono text-[10px] uppercase tracking-caps text-mute-50">
                  {new Date(f.firedAt).toLocaleString()}
                </div>
                <div className="mt-1 font-sans text-[14px] font-medium">{f.reason}</div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

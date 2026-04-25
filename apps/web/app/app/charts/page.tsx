"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Badge,
  Button,
  Panel,
  SectionHeader,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator
} from "@xake/ui";
import { LightweightChart, MockChartAdapter, type ChartStatus } from "@xake/charts";
import type { Timeframe } from "@xake/data-core";
import { useQuoteStream } from "../../../lib/use-quote-stream";
import { useWorkspace } from "../../../lib/workspace-store";

const ADAPTER = new MockChartAdapter();
const TIMEFRAMES: Timeframe[] = ["1m", "5m", "15m", "1h", "4h", "1d"];

export default function ChartWorkspacePage() {
  return (
    <Suspense fallback={null}>
      <ChartWorkspaceInner />
    </Suspense>
  );
}

function ChartWorkspaceInner() {
  const params = useSearchParams();
  const { activeSymbol, activeTimeframe, chartType, setActiveSymbol, setActiveTimeframe, setChartType } = useWorkspace();
  const [status, setStatus] = useState<ChartStatus>({ loading: true });
  const [symbolInput, setSymbolInput] = useState(activeSymbol);

  useEffect(() => {
    const p = params.get("symbol");
    if (p && p !== activeSymbol) {
      setActiveSymbol(p.toUpperCase());
      setSymbolInput(p.toUpperCase());
    }
  }, [params, activeSymbol, setActiveSymbol]);

  const symbols = useMemo(() => [activeSymbol], [activeSymbol]);
  const { quotes, connected, staleMs } = useQuoteStream(symbols);
  const q = quotes[activeSymbol];
  const stale = staleMs > 8000;

  return (
    <>
      <SectionHeader
        eyebrow="Workspace"
        title={`Charts · ${activeSymbol}`}
        description="Lightweight Charts-driven workspace. Data is served by the charts adapter — swap in a live provider adapter in a later stage."
        actions={
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setActiveSymbol(symbolInput.trim().toUpperCase());
            }}
            style={{ display: "inline-flex", gap: 8 }}
          >
            <input
              className="xake-input"
              value={symbolInput}
              onChange={(e) => setSymbolInput(e.target.value)}
              style={{ width: 180, fontFamily: "var(--font-mono)" }}
            />
            <Button type="submit" variant="secondary">
              Load
            </Button>
          </form>
        }
      />

      <Panel
        title={
          <>
            <span>{activeSymbol}</span>
            <Badge tone={connected ? "positive" : "negative"} dot>
              {connected ? "live" : "offline"}
            </Badge>
            {stale ? <Badge tone="warning">stale · {Math.round(staleMs / 1000)}s</Badge> : null}
            {q ? (
              <span className="xake-numeric" style={{ color: q.changePct && q.changePct >= 0 ? "var(--colour-positive)" : "var(--colour-negative)" }}>
                {q.last.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                {q.changePct !== undefined ? ` (${q.changePct >= 0 ? "+" : ""}${q.changePct.toFixed(2)}%)` : ""}
              </span>
            ) : null}
          </>
        }
        actions={
          <Tabs value={activeTimeframe} onValueChange={(v) => setActiveTimeframe(v as Timeframe)}>
            <TabsList>
              {TIMEFRAMES.map((t) => (
                <TabsTrigger key={t} value={t}>
                  {t}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={activeTimeframe} />
          </Tabs>
        }
        flush
      >
        <div style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--colour-border)" }}>
          <Toolbar>
            <ToolbarGroup>
              <Button size="sm" variant={chartType === "candles" ? "secondary" : "ghost"} onClick={() => setChartType("candles")}>
                Candles
              </Button>
              <Button size="sm" variant={chartType === "line" ? "secondary" : "ghost"} onClick={() => setChartType("line")}>
                Line
              </Button>
              <Button size="sm" variant={chartType === "area" ? "secondary" : "ghost"} onClick={() => setChartType("area")}>
                Area
              </Button>
            </ToolbarGroup>
            <ToolbarSeparator />
            <ToolbarGroup>
              <Button size="sm" variant="ghost" disabled>
                EMA
              </Button>
              <Button size="sm" variant="ghost" disabled>
                VWAP
              </Button>
              <Button size="sm" variant="ghost" disabled>
                RSI
              </Button>
            </ToolbarGroup>
            <ToolbarSeparator />
            <ToolbarGroup>
              <Button size="sm" variant="ghost" disabled>
                Crosshair
              </Button>
              <Button size="sm" variant="ghost" disabled>
                Measure
              </Button>
            </ToolbarGroup>
            <span style={{ marginLeft: "auto", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--colour-text-muted)" }}>
              indicators land in Stage 7 · chart source: {status.source ?? "mock"}
            </span>
          </Toolbar>
        </div>
        <div style={{ padding: "var(--space-3)" }}>
          <LightweightChart
            symbol={activeSymbol}
            timeframe={activeTimeframe}
            chartType={chartType}
            adapter={ADAPTER}
            height={440}
            onStatus={setStatus}
          />
        </div>
      </Panel>
    </>
  );
}

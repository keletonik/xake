"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardMeta,
  CardTitle,
  Panel,
  SectionHeader
} from "@xake/ui";
import type { PortfolioSnapshot } from "@xake/trading-core";
import { api } from "../../lib/api-client";
import { useQuoteStream } from "../../lib/use-quote-stream";

const DEFAULT_SYMBOLS = ["AAPL", "NVDA", "BTC-USD", "ETH-USD"];

export default function DashboardPage() {
  const [portfolio, setPortfolio] = useState<PortfolioSnapshot | null>(null);
  const { quotes, connected, staleMs } = useQuoteStream(DEFAULT_SYMBOLS);

  useEffect(() => {
    const poll = async () => {
      try {
        setPortfolio(await api.get<PortfolioSnapshot>("/v1/portfolio"));
      } catch {
        setPortfolio(null);
      }
    };
    poll();
    const id = setInterval(poll, 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <SectionHeader
        eyebrow="Workspace"
        title="Dashboard"
        description="Paper environment. Nothing here affects a real account. Feeds are a mock stream unless Coinbase live data is enabled server-side."
        actions={
          <>
            <Link href="/app/paper"><Button variant="primary">Paper ticket</Button></Link>
            <Link href="/app/assistant"><Button variant="secondary">Assistant</Button></Link>
          </>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-3)" }}>
        <Card>
          <CardMeta>Paper equity</CardMeta>
          <CardTitle>
            <span className="xake-numeric">
              {portfolio ? portfolio.totalEquity.toLocaleString(undefined, { style: "currency", currency: portfolio.balance.currency }) : "—"}
            </span>
          </CardTitle>
          <CardDescription>
            Cash {portfolio?.balance.cash.toLocaleString(undefined, { style: "currency", currency: portfolio?.balance.currency ?? "USD" }) ?? "—"}
          </CardDescription>
        </Card>

        <Card>
          <CardMeta>Realised P&amp;L</CardMeta>
          <CardTitle>
            <span
              className="xake-numeric"
              style={{ color: (portfolio?.totalRealisedPnl ?? 0) >= 0 ? "var(--colour-positive)" : "var(--colour-negative)" }}
            >
              {portfolio ? portfolio.totalRealisedPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
            </span>
          </CardTitle>
          <CardDescription>Session-to-date, paper</CardDescription>
        </Card>

        <Card>
          <CardMeta>Open positions</CardMeta>
          <CardTitle>
            <span className="xake-numeric">{portfolio?.positions.filter((p) => p.quantity !== 0).length ?? 0}</span>
          </CardTitle>
          <CardDescription>Unrealised {portfolio ? portfolio.totalUnrealisedPnl.toFixed(2) : "—"}</CardDescription>
        </Card>

        <Card>
          <CardMeta>Stream</CardMeta>
          <CardTitle>
            <Badge tone={connected ? "positive" : "negative"} dot>
              {connected ? "connected" : "offline"}
            </Badge>
          </CardTitle>
          <CardDescription>Last event {Math.round(staleMs / 1000)}s ago</CardDescription>
        </Card>
      </div>

      <Panel title="Top tape" actions={<Link href="/app/markets" style={{ color: "var(--colour-accent)", fontSize: "var(--text-dense)" }}>Explore markets →</Link>}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-3)" }}>
          {DEFAULT_SYMBOLS.map((sym) => {
            const q = quotes[sym];
            const tone = q && q.changePct !== undefined ? (q.changePct >= 0 ? "var(--colour-positive)" : "var(--colour-negative)") : "var(--colour-text-secondary)";
            return (
              <Card key={sym}>
                <CardMeta>{q?.attribution.source ?? "—"}{q?.attribution.feedClass ? ` · ${q.attribution.feedClass}` : ""}</CardMeta>
                <CardTitle>
                  <Link href={`/app/charts?symbol=${encodeURIComponent(sym)}`} style={{ color: "var(--colour-text-primary)" }}>{sym}</Link>
                </CardTitle>
                <CardDescription>
                  <span className="xake-numeric" style={{ fontSize: "var(--text-numeric-md)", fontWeight: 600 }}>
                    {q ? q.last.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "—"}
                  </span>
                  {q?.changePct !== undefined ? (
                    <span className="xake-numeric" style={{ color: tone, marginLeft: 8 }}>
                      {q.changePct >= 0 ? "+" : ""}
                      {q.changePct.toFixed(2)}%
                    </span>
                  ) : null}
                </CardDescription>
              </Card>
            );
          })}
        </div>
      </Panel>
    </>
  );
}

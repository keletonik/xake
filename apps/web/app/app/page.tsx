"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  EmptyState,
  Panel,
  SectionHeader
} from "@xake/ui";
import type { Fill, Order, PortfolioSnapshot, Position } from "@xake/trading-core";
import type { Quote } from "@xake/data-core";
import { api } from "../../lib/api-client";
import { useQuoteStream } from "../../lib/use-quote-stream";

const DEFAULT_SYMBOLS = ["AAPL", "NVDA", "BTC-USD", "ETH-USD"];
const EQUITY_HISTORY_CAP = 60;

export default function DashboardPage() {
  const [portfolio, setPortfolio] = useState<PortfolioSnapshot | null>(null);
  const [recentFills, setRecentFills] = useState<Fill[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const equityHistoryRef = useRef<number[]>([]);
  const [equitySeries, setEquitySeries] = useState<number[]>([]);

  const watchSymbols = useMemo(() => {
    const fromPositions = (portfolio?.positions ?? [])
      .filter((p) => p.quantity !== 0)
      .map((p) => p.symbol);
    const merged = Array.from(new Set([...DEFAULT_SYMBOLS, ...fromPositions]));
    return merged.slice(0, 8);
  }, [portfolio]);

  const { quotes, connected, staleMs, source } = useQuoteStream(watchSymbols);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const [snap, activity] = await Promise.all([
          api.get<PortfolioSnapshot>("/v1/portfolio"),
          api
            .get<{ orders: Order[]; fills: Fill[] }>("/v1/portfolio/activity")
            .catch(() => ({ orders: [], fills: [] }))
        ]);
        if (cancelled) return;
        setPortfolio(snap);
        setRecentOrders(activity.orders.slice(-5).reverse());
        setRecentFills(activity.fills.slice(-5).reverse());

        const next = [...equityHistoryRef.current, snap.totalEquity];
        if (next.length > EQUITY_HISTORY_CAP) next.shift();
        equityHistoryRef.current = next;
        setEquitySeries(next);
      } catch {
        if (!cancelled) setPortfolio(null);
      }
    };
    void poll();
    const id = setInterval(poll, 10_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const currency = portfolio?.balance.currency ?? "USD";
  const sessionPnl =
    (portfolio?.totalRealisedPnl ?? 0) + (portfolio?.totalUnrealisedPnl ?? 0);
  const startEquity = portfolio ? portfolio.totalEquity - sessionPnl : 0;
  const sessionPct =
    startEquity > 0 ? (sessionPnl / startEquity) * 100 : 0;
  const sessionUp = sessionPnl >= 0;

  const openPositions = (portfolio?.positions ?? []).filter(
    (p) => p.quantity !== 0
  );
  const topPositions = [...openPositions]
    .sort((a, b) => Math.abs(marketValue(b)) - Math.abs(marketValue(a)))
    .slice(0, 5);

  const tape = watchSymbols
    .map((sym) => quotes[sym])
    .filter((q): q is Quote => Boolean(q));

  const topMovers = [...tape]
    .filter((q) => typeof q.changePct === "number")
    .sort(
      (a, b) => Math.abs(b.changePct ?? 0) - Math.abs(a.changePct ?? 0)
    )
    .slice(0, 5);

  return (
    <>
      <SectionHeader
        eyebrow="Workspace"
        title="Dashboard"
        description="Paper environment. Nothing here affects a real account. Feeds are a mock stream unless Coinbase live data is enabled server-side."
      />

      <section className="dash-hero">
        <div className="dash-hero__inner">
          <span className="dash-hero__eyebrow">Paper equity · session-to-date</span>
          <h2 className="dash-hero__display">
            {portfolio
              ? portfolio.totalEquity.toLocaleString(undefined, {
                  style: "currency",
                  currency
                })
              : "—"}
          </h2>
          <div className="dash-hero__delta">
            <Badge tone={sessionUp ? "positive" : "negative"} dot>
              {portfolio
                ? `${sessionUp ? "+" : ""}${sessionPct.toFixed(2)}%`
                : "—"}
            </Badge>
            <span
              className="dash-hero__delta-pct"
              style={{
                color: sessionUp
                  ? "var(--colour-positive)"
                  : "var(--colour-negative)"
              }}
            >
              {portfolio
                ? `${sessionUp ? "+" : ""}${sessionPnl.toLocaleString(undefined, {
                    style: "currency",
                    currency
                  })}`
                : "—"}
            </span>
            <span className="dash-hero__delta-abs">
              vs. session open
            </span>
          </div>
          <div className="dash-hero__actions">
            <Link href="/app/paper">
              <Button variant="primary">Paper ticket</Button>
            </Link>
            <Link href="/app/portfolio">
              <Button variant="secondary">View portfolio</Button>
            </Link>
            <Link href="/app/assistant">
              <Button variant="ghost">Assistant</Button>
            </Link>
          </div>
        </div>
        <div className="dash-hero__viz">
          <span className="dash-hero__eyebrow">Equity, last {equitySeries.length || "—"} samples</span>
          <Sparkline values={equitySeries} positive={sessionUp} />
          <span className="xake-micro-label">
            Updates every 10s · paper account
          </span>
        </div>
      </section>

      <div className="dash-stat-strip">
        <StatCell
          label="Cash"
          value={
            portfolio
              ? portfolio.balance.cash.toLocaleString(undefined, {
                  style: "currency",
                  currency
                })
              : "—"
          }
          hint={`Buying power ${
            portfolio
              ? portfolio.balance.buyingPower.toLocaleString(undefined, {
                  style: "currency",
                  currency
                })
              : "—"
          }`}
        />
        <StatCell
          label="Realised P&L"
          value={
            portfolio ? portfolio.totalRealisedPnl.toFixed(2) : "—"
          }
          tone={
            (portfolio?.totalRealisedPnl ?? 0) >= 0 ? "positive" : "negative"
          }
          hint="Booked from closed legs"
        />
        <StatCell
          label="Unrealised P&L"
          value={
            portfolio ? portfolio.totalUnrealisedPnl.toFixed(2) : "—"
          }
          tone={
            (portfolio?.totalUnrealisedPnl ?? 0) >= 0 ? "positive" : "negative"
          }
          hint="Marked to last quote"
        />
        <StatCell
          label="Open positions"
          value={String(openPositions.length)}
          hint={
            openPositions.length === 0
              ? "Submit a paper order to begin"
              : `${openPositions.length} symbol${openPositions.length === 1 ? "" : "s"}`
          }
        />
        <StatCell
          label="Stream"
          value={
            <Badge tone={connected ? "positive" : "negative"} dot>
              {connected ? "live" : "offline"}
            </Badge>
          }
          hint={`${source ?? "mock"} · last ${Math.round(staleMs / 1000)}s ago`}
        />
      </div>

      <div className="dash-cols-2">
        <Panel
          title="Top movers"
          actions={
            <Link
              href="/app/markets"
              style={{ color: "var(--colour-accent)", fontSize: "var(--text-dense)" }}
            >
              Explore markets →
            </Link>
          }
        >
          {topMovers.length === 0 ? (
            <EmptyState
              title="Waiting for the tape"
              description="Quotes will appear once the stream warms up."
            />
          ) : (
            <div className="dash-list">
              {topMovers.map((q) => {
                const up = (q.changePct ?? 0) >= 0;
                return (
                  <Link
                    key={q.symbol}
                    href={`/app/charts?symbol=${encodeURIComponent(q.symbol)}`}
                    className="dash-list__row dash-list__row--4"
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    <span className="dash-list__symbol">{q.symbol}</span>
                    <span className="dash-list__num">
                      {q.last.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4
                      })}
                    </span>
                    <span
                      className="dash-list__num"
                      style={{
                        color: up
                          ? "var(--colour-positive)"
                          : "var(--colour-negative)"
                      }}
                    >
                      {up ? "+" : ""}
                      {(q.changePct ?? 0).toFixed(2)}%
                    </span>
                    <span className="dash-list__time">
                      {q.attribution.feedClass}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel
          title="Top positions"
          actions={
            <Link
              href="/app/portfolio"
              style={{ color: "var(--colour-accent)", fontSize: "var(--text-dense)" }}
            >
              Full portfolio →
            </Link>
          }
        >
          {topPositions.length === 0 ? (
            <EmptyState
              title="No open positions"
              description="Place a paper order to see exposures here."
              actions={
                <Link href="/app/paper">
                  <Button variant="primary" size="sm">
                    Paper ticket
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="dash-list">
              {topPositions.map((pos) => {
                const mv = marketValue(pos);
                const up = (pos.unrealisedPnl ?? 0) >= 0;
                return (
                  <div
                    key={pos.symbol}
                    className="dash-list__row dash-list__row--4"
                  >
                    <span className="dash-list__symbol">{pos.symbol}</span>
                    <span className="dash-list__num">
                      {pos.quantity}
                    </span>
                    <span className="dash-list__num">
                      {mv.toLocaleString(undefined, {
                        style: "currency",
                        currency
                      })}
                    </span>
                    <span
                      className="dash-list__num"
                      style={{
                        color: up
                          ? "var(--colour-positive)"
                          : "var(--colour-negative)"
                      }}
                    >
                      {(pos.unrealisedPnl ?? 0) >= 0 ? "+" : ""}
                      {(pos.unrealisedPnl ?? 0).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </div>

      <Panel
        title="Recent activity"
        actions={
          <Link
            href="/app/portfolio"
            style={{ color: "var(--colour-accent)", fontSize: "var(--text-dense)" }}
          >
            History →
          </Link>
        }
      >
        {recentFills.length === 0 && recentOrders.length === 0 ? (
          <EmptyState
            title="No activity yet"
            description="Fills and orders posted on this paper account will surface here."
          />
        ) : (
          <div className="dash-list">
            {recentFills.length > 0
              ? recentFills.map((f) => (
                  <div
                    key={f.id}
                    className="dash-list__row dash-list__row--5"
                  >
                    <span className="dash-list__symbol">{f.symbol}</span>
                    <Badge tone={f.side === "buy" ? "positive" : "negative"}>
                      {f.side.toUpperCase()}
                    </Badge>
                    <span className="dash-list__num">{f.quantity}</span>
                    <span className="dash-list__num">
                      @ {f.price.toFixed(4)}
                    </span>
                    <span className="dash-list__time">
                      {new Date(f.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              : recentOrders.map((o) => (
                  <div
                    key={o.id}
                    className="dash-list__row dash-list__row--5"
                  >
                    <span className="dash-list__symbol">{o.symbol}</span>
                    <Badge tone={o.side === "buy" ? "positive" : "negative"}>
                      {o.side.toUpperCase()}
                    </Badge>
                    <span className="dash-list__num">{o.quantity}</span>
                    <Badge tone={statusTone(o.status)}>{o.status}</Badge>
                    <span className="dash-list__time">
                      {new Date(o.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
          </div>
        )}
      </Panel>
    </>
  );
}

function marketValue(p: Position): number {
  if (typeof p.marketValue === "number") return p.marketValue;
  if (typeof p.lastPrice === "number") return p.quantity * p.lastPrice;
  return p.quantity * p.averageCost;
}

function statusTone(
  s: Order["status"]
): "neutral" | "positive" | "negative" | "warning" | "info" | "accent" {
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
}

function StatCell({
  label,
  value,
  hint,
  tone
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="dash-stat-strip__cell">
      <span className="dash-stat-strip__label">{label}</span>
      <span
        className="dash-stat-strip__value"
        style={
          tone
            ? {
                color:
                  tone === "positive"
                    ? "var(--colour-positive)"
                    : "var(--colour-negative)"
              }
            : undefined
        }
      >
        {value}
      </span>
      {hint ? <span className="dash-stat-strip__hint">{hint}</span> : null}
    </div>
  );
}

function Sparkline({
  values,
  positive
}: {
  values: number[];
  positive: boolean;
}) {
  if (values.length < 2) {
    return (
      <svg className="dash-spark" viewBox="0 0 100 30" preserveAspectRatio="none">
        <line
          x1="0"
          y1="15"
          x2="100"
          y2="15"
          stroke="var(--colour-border-strong)"
          strokeWidth="0.6"
          strokeDasharray="2 3"
        />
      </svg>
    );
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = 100 / (values.length - 1);
  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = 30 - ((v - min) / range) * 28 - 1;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  const stroke = positive
    ? "var(--colour-positive)"
    : "var(--colour-negative)";
  const fill = positive
    ? "var(--colour-positive-subtle)"
    : "var(--colour-negative-subtle)";
  const area = `0,30 ${points} 100,30`;
  return (
    <svg
      className="dash-spark"
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      role="img"
      aria-label="Equity sparkline"
    >
      <polygon points={area} fill={fill} stroke="none" />
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

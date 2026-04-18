"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardMeta,
  CardTitle,
  EmptyState,
  ErrorState,
  Input,
  Panel,
  SectionHeader,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@xake/ui";
import type { Instrument, Quote } from "@xake/data-core";
import { api } from "../../../lib/api-client";
import { useQuoteStream } from "../../../lib/use-quote-stream";
import { useWorkspace } from "../../../lib/workspace-store";

type Filter = "all" | "equity" | "crypto" | "fx" | "index";

export default function MarketsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Instrument | null>(null);
  const [watchlists, setWatchlists] = useState<{ id: string; name: string }[]>([]);
  const { setActiveSymbol } = useWorkspace();

  useEffect(() => {
    const run = async () => {
      setError(null);
      try {
        const q = new URLSearchParams();
        if (query) q.set("q", query);
        if (filter !== "all") q.set("asset_class", filter);
        const r = await api.get<{ items: Instrument[] }>(`/v1/instruments?${q.toString()}`);
        setInstruments(r.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load instruments");
      }
    };
    const t = setTimeout(run, 150);
    return () => clearTimeout(t);
  }, [query, filter]);

  useEffect(() => {
    api
      .get<{ items: { id: string; name: string }[] }>("/v1/watchlists")
      .then((r) => setWatchlists(r.items))
      .catch(() => setWatchlists([]));
  }, []);

  const subscribed = useMemo(() => instruments.slice(0, 30).map((i) => i.symbol), [instruments]);
  const { quotes } = useQuoteStream(subscribed);

  const addTo = async (watchlistId: string, symbol: string) => {
    try {
      await api.post(`/v1/watchlists/${watchlistId}/items`, { symbol });
    } catch {
      /* surfaced via refetch in watchlists page */
    }
  };

  return (
    <>
      <SectionHeader
        eyebrow="Workspace"
        title="Markets"
        description="Search the instrument catalogue. Prices stream live from the API gateway; provider and feed class are stamped on every row."
      />

      <Panel
        title="Explorer"
        actions={
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="equity">Equities</TabsTrigger>
              <TabsTrigger value="crypto">Crypto</TabsTrigger>
              <TabsTrigger value="fx">FX</TabsTrigger>
              <TabsTrigger value="index">Index</TabsTrigger>
            </TabsList>
            <TabsContent value={filter} />
          </Tabs>
        }
      >
        <Input
          placeholder="Search AAPL, BTC, NVIDIA…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search instruments"
          style={{ marginBottom: "var(--space-3)" }}
        />

        {error ? (
          <ErrorState title="Could not load instruments" description={error} detail="MARKETS_LOAD_FAIL" />
        ) : instruments.length === 0 ? (
          <EmptyState title="No matches" description="Try a ticker fragment like NVD, or pick an asset class tab." />
        ) : (
          <div role="list" style={{ display: "grid", gap: 6 }}>
            {instruments.map((i) => {
              const q = quotes[i.symbol];
              const tone = q?.changePct !== undefined ? (q.changePct >= 0 ? "var(--colour-positive)" : "var(--colour-negative)") : "var(--colour-text-secondary)";
              return (
                <button
                  key={i.id}
                  role="listitem"
                  onClick={() => {
                    setPreview(i);
                    setActiveSymbol(i.symbol);
                  }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1fr 0.8fr 0.8fr auto",
                    gap: 12,
                    alignItems: "center",
                    padding: "10px 12px",
                    border: "1px solid var(--colour-border)",
                    borderRadius: "var(--radius-md)",
                    background: preview?.id === i.id ? "var(--colour-accent-subtle)" : "var(--colour-bg-raised)",
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{i.symbol}</div>
                    <div style={{ fontSize: "var(--text-dense)", color: "var(--colour-text-secondary)" }}>
                      {i.displayName}
                    </div>
                  </div>
                  <div style={{ fontSize: "var(--text-dense)", color: "var(--colour-text-muted)" }}>
                    {i.assetClass} · {i.venue}
                  </div>
                  <div className="xake-numeric" style={{ textAlign: "right" }}>
                    {q ? q.last.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "—"}
                  </div>
                  <div className="xake-numeric" style={{ textAlign: "right", color: tone }}>
                    {q?.changePct !== undefined ? `${q.changePct >= 0 ? "+" : ""}${q.changePct.toFixed(2)}%` : "—"}
                  </div>
                  <Badge tone={q?.attribution.feedClass === "realtime" ? "positive" : q?.attribution.feedClass === "mock" ? "warning" : "neutral"}>
                    {q?.attribution.feedClass ?? "no feed"}
                  </Badge>
                </button>
              );
            })}
          </div>
        )}
      </Panel>

      {preview ? (
        <Panel title={`${preview.symbol} · preview`} actions={
          <Link href={`/app/charts?symbol=${encodeURIComponent(preview.symbol)}`}>
            <Button variant="primary" size="sm">Open chart</Button>
          </Link>
        }>
          <InstrumentPreview instrument={preview} quote={quotes[preview.symbol]} watchlists={watchlists} onAdd={addTo} />
        </Panel>
      ) : null}
    </>
  );
}

function InstrumentPreview({
  instrument,
  quote,
  watchlists,
  onAdd
}: {
  instrument: Instrument;
  quote?: Quote;
  watchlists: { id: string; name: string }[];
  onAdd: (wid: string, symbol: string) => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-3)" }}>
      <Card>
        <CardMeta>Last price</CardMeta>
        <CardTitle>
          <span className="xake-numeric">
            {quote ? quote.last.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "—"}
          </span>
        </CardTitle>
        <CardDescription>
          {quote?.changePct !== undefined ? (
            <span className="xake-numeric" style={{ color: quote.changePct >= 0 ? "var(--colour-positive)" : "var(--colour-negative)" }}>
              {quote.changePct >= 0 ? "+" : ""}
              {quote.changePct.toFixed(2)}%
            </span>
          ) : "—"}
        </CardDescription>
      </Card>
      <Card>
        <CardMeta>Bid / Ask</CardMeta>
        <CardTitle>
          <span className="xake-numeric">
            {quote?.bid ? quote.bid.toFixed(2) : "—"} / {quote?.ask ? quote.ask.toFixed(2) : "—"}
          </span>
        </CardTitle>
        <CardDescription>Tick size {instrument.tickSize}</CardDescription>
      </Card>
      <Card>
        <CardMeta>Volume (24h / session)</CardMeta>
        <CardTitle>
          <span className="xake-numeric">{quote?.volume ? quote.volume.toLocaleString() : "—"}</span>
        </CardTitle>
        <CardDescription>Venue {instrument.venue}</CardDescription>
      </Card>
      <Card>
        <CardMeta>Source</CardMeta>
        <CardTitle>
          <Badge tone={quote?.attribution.feedClass === "realtime" ? "positive" : quote?.attribution.feedClass === "mock" ? "warning" : "neutral"}>
            {quote?.attribution.source ?? "—"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Feed {quote?.attribution.feedClass ?? "—"} · age {quote ? Math.max(0, Math.round((Date.now() - quote.timestamp) / 1000)) : "—"}s
        </CardDescription>
      </Card>
      <Card>
        <CardMeta>Add to watchlist</CardMeta>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {watchlists.length === 0 ? <span style={{ color: "var(--colour-text-muted)" }}>No watchlists yet</span> : null}
          {watchlists.map((w) => (
            <Button key={w.id} size="sm" variant="secondary" onClick={() => onAdd(w.id, instrument.symbol)}>
              + {w.name}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}

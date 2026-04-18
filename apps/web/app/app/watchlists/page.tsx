"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Panel,
  SectionHeader,
  Separator
} from "@xake/ui";
import type { Watchlist } from "@xake/trading-core";
import { api } from "../../../lib/api-client";
import { useQuoteStream } from "../../../lib/use-quote-stream";
import { useWorkspace } from "../../../lib/workspace-store";

export default function WatchlistsPage() {
  const [lists, setLists] = useState<Watchlist[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>();
  const [newName, setNewName] = useState("");
  const [newSymbol, setNewSymbol] = useState("");
  const { setSelectedWatchlist } = useWorkspace();

  const load = async () => {
    const r = await api.get<{ items: Watchlist[] }>("/v1/watchlists");
    setLists(r.items);
    if (!activeId && r.items[0]) setActiveId(r.items[0].id);
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    setSelectedWatchlist(activeId);
  }, [activeId, setSelectedWatchlist]);

  const active = useMemo(() => lists.find((l) => l.id === activeId), [lists, activeId]);
  const symbols = useMemo(
    () =>
      [...(active?.items ?? [])]
        .sort((a, b) => Number(b.pinned) - Number(a.pinned))
        .map((i) => i.symbol),
    [active]
  );
  const { quotes } = useQuoteStream(symbols);

  const create = async () => {
    if (!newName.trim()) return;
    const r = await api.post<{ watchlist: Watchlist }>("/v1/watchlists", { name: newName.trim() });
    setNewName("");
    setLists((prev) => [...prev, r.watchlist]);
    setActiveId(r.watchlist.id);
  };

  const remove = async (id: string) => {
    await api.del(`/v1/watchlists/${id}`);
    setLists((prev) => prev.filter((w) => w.id !== id));
    if (activeId === id) setActiveId(undefined);
  };

  const addSymbol = async () => {
    if (!active || !newSymbol.trim()) return;
    const r = await api.post<{ watchlist: Watchlist }>(`/v1/watchlists/${active.id}/items`, {
      symbol: newSymbol.trim().toUpperCase()
    });
    setLists((prev) => prev.map((w) => (w.id === r.watchlist.id ? r.watchlist : w)));
    setNewSymbol("");
  };

  const removeSymbol = async (symbol: string) => {
    if (!active) return;
    const r = await api.del<{ watchlist: Watchlist }>(`/v1/watchlists/${active.id}/items/${encodeURIComponent(symbol)}`);
    setLists((prev) => prev.map((w) => (w.id === r.watchlist.id ? r.watchlist : w)));
  };

  return (
    <>
      <SectionHeader
        eyebrow="Workspace"
        title="Watchlists"
        description="Lists of intent, not just tickers. Pin symbols to the top; tag and annotate with context. Assistant drafts land here for confirmation."
      />

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "var(--space-4)" }}>
        <Panel title="Lists" actions={null}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void create();
            }}
            style={{ display: "flex", gap: 8, marginBottom: "var(--space-3)" }}
          >
            <Input placeholder="New watchlist" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Button type="submit" variant="primary" size="sm">
              Add
            </Button>
          </form>
          {lists.length === 0 ? (
            <EmptyState title="No watchlists yet" description="Create one to start tracking instruments by theme." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {lists.map((w) => (
                <div
                  key={w.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 10px",
                    borderRadius: "var(--radius-md)",
                    background: w.id === activeId ? "var(--colour-accent-subtle)" : "transparent",
                    border: "1px solid var(--colour-border)"
                  }}
                >
                  <button
                    onClick={() => setActiveId(w.id)}
                    style={{ flex: 1, textAlign: "left", color: "var(--colour-text-primary)" }}
                  >
                    {w.name}{" "}
                    <span style={{ color: "var(--colour-text-muted)", fontSize: "var(--text-dense)" }}>
                      · {w.items.length}
                    </span>
                  </button>
                  <Button size="sm" variant="ghost" onClick={() => void remove(w.id)}>
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {active ? (
          <Panel
            title={
              <>
                <span>{active.name}</span>
                <Badge>{active.items.length} items</Badge>
              </>
            }
            actions={
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void addSymbol();
                }}
                style={{ display: "inline-flex", gap: 8 }}
              >
                <Input placeholder="Symbol" value={newSymbol} onChange={(e) => setNewSymbol(e.target.value)} style={{ width: 160 }} />
                <Button type="submit" variant="secondary" size="sm">
                  Add
                </Button>
              </form>
            }
          >
            {active.items.length === 0 ? (
              <EmptyState
                title="List is empty"
                description="Add a symbol via the form, or ask the assistant to draft a starter watchlist around a theme."
              />
            ) : (
              <div role="grid" style={{ display: "grid", gap: 6 }}>
                {[...active.items]
                  .sort((a, b) => Number(b.pinned) - Number(a.pinned))
                  .map((item) => {
                    const q = quotes[item.symbol];
                    const tone = q?.changePct !== undefined ? (q.changePct >= 0 ? "var(--colour-positive)" : "var(--colour-negative)") : "var(--colour-text-secondary)";
                    return (
                      <div
                        key={item.symbol}
                        role="row"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr auto",
                          gap: 12,
                          alignItems: "center",
                          padding: "8px 12px",
                          border: "1px solid var(--colour-border)",
                          borderRadius: "var(--radius-md)",
                          background: "var(--colour-bg-raised)"
                        }}
                      >
                        <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                          {item.pinned ? "◆ " : ""}{item.symbol}
                        </div>
                        <div className="xake-numeric" style={{ textAlign: "right" }}>
                          {q ? q.last.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "—"}
                        </div>
                        <div className="xake-numeric" style={{ textAlign: "right", color: tone }}>
                          {q?.changePct !== undefined ? `${q.changePct >= 0 ? "+" : ""}${q.changePct.toFixed(2)}%` : "—"}
                        </div>
                        <div style={{ display: "inline-flex", gap: 4 }}>
                          <Link href={`/app/charts?symbol=${encodeURIComponent(item.symbol)}`}>
                            <Button size="sm" variant="ghost">Chart</Button>
                          </Link>
                          <Button size="sm" variant="ghost" onClick={() => void removeSymbol(item.symbol)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                <Separator />
                <span className="xake-micro-label">Sparklines and tag filters land in Stage 7.</span>
              </div>
            )}
          </Panel>
        ) : null}
      </div>
    </>
  );
}

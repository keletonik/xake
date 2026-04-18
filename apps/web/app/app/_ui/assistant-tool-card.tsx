"use client";

import { useState } from "react";
import { Badge, Button, Card, CardDescription, CardMeta, CardTitle } from "@xake/ui";
import {
  AlertDraftSchema,
  OrderDraftSchema
} from "@xake/trading-core";
import { WatchlistDraftSchema } from "@xake/ai-core";
import { api } from "../../../lib/api-client";

/**
 * Renders a tool-call payload from the assistant as a confirmable draft.
 * The assistant never places anything — this component only *offers* the
 * draft. The user must click "Accept" for any state to change, and the
 * API validates the payload again server-side.
 */

export function AssistantToolCard({ name, input }: { name: string; input: unknown }) {
  const [status, setStatus] = useState<"idle" | "confirming" | "accepted" | "rejected">("idle");
  const [message, setMessage] = useState<string>();

  const title = TITLES[name] ?? name;

  const summary = formatSummary(name, input);

  const confirm = async () => {
    setStatus("confirming");
    setMessage(undefined);
    try {
      if (name === "draft_paper_order") {
        const parsed = OrderDraftSchema.safeParse(input);
        if (!parsed.success) throw new Error("Invalid order draft");
        const r = await api.post("/v1/orders", parsed.data);
        setStatus("accepted");
        setMessage(`Paper order submitted: ${JSON.stringify(r)}`);
      } else if (name === "suggest_alert") {
        const parsed = AlertDraftSchema.safeParse(input);
        if (!parsed.success) throw new Error("Invalid alert draft");
        const r = await api.post("/v1/alerts", parsed.data);
        setStatus("accepted");
        setMessage(`Alert created: ${JSON.stringify(r)}`);
      } else if (name === "build_watchlist") {
        const parsed = WatchlistDraftSchema.safeParse(input);
        if (!parsed.success) throw new Error("Invalid watchlist draft");
        const w = await api.post<{ watchlist: { id: string } }>("/v1/watchlists", {
          name: parsed.data.name,
          description: parsed.data.description
        });
        for (const item of parsed.data.items) {
          await api.post(`/v1/watchlists/${w.watchlist.id}/items`, item);
        }
        setStatus("accepted");
        setMessage("Watchlist created.");
      } else {
        setStatus("accepted");
        setMessage("Summary recorded locally.");
      }
    } catch (err) {
      setStatus("rejected");
      setMessage(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <Card>
      <CardMeta>AI draft · awaits confirmation</CardMeta>
      <CardTitle>
        {title}{" "}
        <Badge tone={status === "accepted" ? "positive" : status === "rejected" ? "negative" : "warning"}>
          {status}
        </Badge>
      </CardTitle>
      <CardDescription>
        <pre
          style={{
            margin: 0,
            padding: 10,
            background: "var(--colour-bg-canvas)",
            border: "1px solid var(--colour-border)",
            borderRadius: "var(--radius-md)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            whiteSpace: "pre-wrap",
            color: "var(--colour-text-secondary)"
          }}
        >
{summary}
        </pre>
      </CardDescription>
      {message ? (
        <p style={{ color: "var(--colour-text-muted)", fontSize: "var(--text-micro)" }}>{message}</p>
      ) : null}
      <div style={{ display: "inline-flex", gap: 8 }}>
        <Button variant="primary" size="sm" disabled={status !== "idle"} onClick={confirm}>
          Accept
        </Button>
        <Button variant="ghost" size="sm" disabled={status !== "idle"} onClick={() => setStatus("rejected")}>
          Dismiss
        </Button>
      </div>
    </Card>
  );
}

const TITLES: Record<string, string> = {
  draft_paper_order: "Paper order draft",
  suggest_alert: "Alert suggestion",
  build_watchlist: "Watchlist draft",
  summarise_news: "News summary",
  explain_chart: "Chart read",
  search_instruments: "Instrument search"
};

const formatSummary = (name: string, input: unknown): string => {
  try {
    return JSON.stringify(input, null, 2);
  } catch {
    return `(unserialisable input for ${name})`;
  }
};

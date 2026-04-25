"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardMeta,
  CardTitle,
  Input,
  Panel,
  SectionHeader,
  Separator
} from "@xake/ui";
import { useAssistantStream } from "../../../lib/use-assistant-stream";
import { useWorkspace } from "../../../lib/workspace-store";
import { AssistantToolCard } from "../_ui/assistant-tool-card";

const QUICK_PROMPTS = [
  "Give me a read on AAPL at 1h.",
  "Build a watchlist around AI infrastructure.",
  "Draft a paper-trade idea on NVDA with reasoning.",
  "Why did BTC move in the last session?"
];

export default function AssistantPage() {
  const { activeSymbol, activeTimeframe, selectedWatchlistId } = useWorkspace();
  const { messages, toolCalls, send, cancel, reset, status, errorMessage } = useAssistantStream();
  const [draft, setDraft] = useState("");

  const sendPrompt = (text: string) => {
    setDraft("");
    void send(text, { activeSymbol, activeTimeframe, selectedWatchlistId });
  };

  return (
    <>
      <SectionHeader
        eyebrow="Workspace"
        title="Assistant"
        description="AI co-pilot. It explains markets, summarises news, drafts watchlists, suggests alerts, and drafts paper orders. It never places orders on its own."
        actions={
          <>
            <Badge tone="accent" dot>server-side</Badge>
            <Badge tone="warning">drafts only</Badge>
            <Button size="sm" variant="ghost" onClick={reset}>Clear</Button>
          </>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "var(--space-4)" }}>
        <Panel title="Conversation" dense>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {messages.length === 0 ? (
              <Card>
                <CardMeta>Getting started</CardMeta>
                <CardTitle>Ask anything about a market read, a setup, or a draft.</CardTitle>
                <CardDescription>
                  Context used: {activeSymbol} · {activeTimeframe}
                  {selectedWatchlistId ? " · watchlist selected" : ""}
                </CardDescription>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {QUICK_PROMPTS.map((p) => (
                    <Button key={p} size="sm" variant="secondary" onClick={() => sendPrompt(p)}>
                      {p}
                    </Button>
                  ))}
                </div>
              </Card>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    background: m.role === "user" ? "var(--colour-accent-subtle)" : "var(--colour-bg-raised)",
                    border: "1px solid var(--colour-border)",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.55
                  }}
                >
                  <div className="xake-micro-label" style={{ marginBottom: 4 }}>
                    {m.role}
                    {m.streaming ? " · streaming" : ""}
                  </div>
                  {m.content || (m.streaming ? "…" : "")}
                </div>
              ))
            )}

            {errorMessage ? (
              <div
                role="alert"
                style={{
                  padding: "10px 12px",
                  border: "1px solid var(--colour-negative-border)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--colour-negative-subtle)",
                  color: "var(--colour-negative)",
                  fontSize: "var(--text-dense)"
                }}
              >
                {errorMessage}
              </div>
            ) : null}
          </div>

          <Separator />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const v = draft.trim();
              if (!v) return;
              sendPrompt(v);
            }}
            style={{ display: "flex", gap: 8 }}
          >
            <Input
              placeholder="Ask about the tape, a watchlist theme, or a paper-trade idea…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={status === "streaming"}
            />
            {status === "streaming" ? (
              <Button type="button" variant="secondary" onClick={cancel}>
                Stop
              </Button>
            ) : (
              <Button type="submit" variant="primary">
                Send
              </Button>
            )}
          </form>
        </Panel>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <Panel title="Drafts awaiting confirmation" dense>
            {toolCalls.length === 0 ? (
              <p style={{ color: "var(--colour-text-muted)", fontSize: "var(--text-dense)" }}>
                The assistant's structured drafts will appear here. Nothing mutates your account until you accept a draft.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {toolCalls.map((t, i) => (
                  <AssistantToolCard key={`${t.ts}-${i}`} name={t.name} input={t.input} />
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Safety model" dense>
            <ul style={{ color: "var(--colour-text-secondary)", fontSize: "var(--text-dense)", paddingLeft: 18, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>No autonomous execution. Drafts become actions only via the Accept button.</li>
              <li>No browser-side API keys. All AI traffic flows through the API.</li>
              <li>Structured outputs validated with Zod schemas server-side and client-side.</li>
              <li>Rate-limit 429s downgrade gracefully to a faster tier.</li>
              <li>Every tool call is auditable.</li>
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}

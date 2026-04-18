"use client";

import { useState } from "react";
import { Badge, Button, Input, Panel, Separator } from "@xake/ui";
import { useAssistantStream } from "../../../lib/use-assistant-stream";
import { useWorkspace } from "../../../lib/workspace-store";
import { AssistantToolCard } from "./assistant-tool-card";

export function AssistantDock() {
  const { activeSymbol, activeTimeframe, selectedWatchlistId } = useWorkspace();
  const { messages, toolCalls, send, cancel, status, errorMessage } = useAssistantStream();
  const [input, setInput] = useState("");

  return (
    <aside
      aria-label="AI assistant"
      style={{
        position: "sticky",
        top: 0,
        alignSelf: "start",
        height: "calc(100vh - var(--topbar-h) - var(--statusbar-h))",
        minHeight: 480,
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Panel
        title={
          <>
            <span>Assistant</span>
            <Badge tone="accent" dot>
              co-pilot
            </Badge>
          </>
        }
        actions={
          <span className="xake-micro-label" style={{ color: "var(--colour-text-muted)" }}>
            never autonomous
          </span>
        }
        dense
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", height: "100%" }}>
          <div
            style={{
              flex: "1 1 auto",
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)"
            }}
          >
            {messages.length === 0 ? (
              <p style={{ color: "var(--colour-text-muted)", fontSize: "var(--text-dense)" }}>
                Ask for a read on {activeSymbol} ({activeTimeframe}), a news catch-up, a watchlist, or a paper order draft. Drafts never place themselves — you confirm.
              </p>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md)",
                    background:
                      m.role === "user" ? "var(--colour-accent-subtle)" : "var(--colour-bg-raised)",
                    border: "1px solid var(--colour-border)",
                    color: "var(--colour-text-primary)",
                    fontSize: "var(--text-dense)",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.5
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

            {toolCalls.length > 0 ? (
              <>
                <Separator />
                <span className="xake-micro-label">Drafts awaiting confirmation</span>
                {toolCalls.map((t, i) => (
                  <AssistantToolCard key={`${t.ts}-${i}`} name={t.name} input={t.input} />
                ))}
              </>
            ) : null}

            {errorMessage ? (
              <div
                role="alert"
                style={{
                  padding: "8px 10px",
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

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const v = input.trim();
              if (!v) return;
              setInput("");
              void send(v, { activeSymbol, activeTimeframe, selectedWatchlistId });
            }}
            style={{ display: "flex", gap: 8 }}
          >
            <Input
              placeholder="Ask the co-pilot…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
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
        </div>
      </Panel>
    </aside>
  );
}

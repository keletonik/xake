"use client";

import { useCallback, useRef, useState } from "react";

export interface AssistantMsg {
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly streaming?: boolean;
}

export interface AssistantToolCall {
  readonly name: string;
  readonly input: unknown;
  readonly ts: number;
}

export interface AssistantContext {
  activeSymbol?: string;
  activeTimeframe?: string;
  selectedWatchlistId?: string;
  selectedWatchlistName?: string;
  watchlistSymbols?: string[];
  timezone?: string;
}

export function useAssistantStream() {
  const [messages, setMessages] = useState<AssistantMsg[]>([]);
  const [toolCalls, setToolCalls] = useState<AssistantToolCall[]>([]);
  const [status, setStatus] = useState<"idle" | "streaming" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (content: string, context: AssistantContext = {}) => {
      if (!content.trim()) return;
      const next: AssistantMsg[] = [...messages, { role: "user", content }, { role: "assistant", content: "", streaming: true }];
      setMessages(next);
      setStatus("streaming");
      setErrorMessage(undefined);

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const res = await fetch("/api/v1/assistant/stream", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: next.filter((m) => !m.streaming).map((m) => ({ role: m.role, content: m.content })),
            context
          }),
          signal: ctrl.signal
        });
        if (!res.ok || !res.body) {
          throw new Error(`stream error ${res.status}`);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let eventName = "message";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let idx: number;
          while ((idx = buffer.indexOf("\n\n")) >= 0) {
            const raw = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);
            const lines = raw.split("\n");
            let data = "";
            eventName = "message";
            for (const line of lines) {
              if (line.startsWith("event:")) eventName = line.slice(6).trim();
              else if (line.startsWith("data:")) data += line.slice(5).trim();
            }
            if (!data) continue;
            try {
              const parsed = JSON.parse(data);
              if (eventName === "text_delta" && typeof parsed.text === "string") {
                setMessages((prev) => {
                  const clone = [...prev];
                  const last = clone[clone.length - 1];
                  if (last) clone[clone.length - 1] = { ...last, content: last.content + parsed.text };
                  return clone;
                });
              } else if (eventName === "tool_use") {
                setToolCalls((prev) => [...prev, { name: parsed.name, input: parsed.input, ts: Date.now() }]);
              } else if (eventName === "error") {
                setErrorMessage(parsed.message ?? "Assistant error");
              } else if (eventName === "stop") {
                break;
              }
            } catch {
              /* ignore malformed events */
            }
          }
        }
        setMessages((prev) => {
          const clone = [...prev];
          const last = clone[clone.length - 1];
          if (last) clone[clone.length - 1] = { ...last, streaming: false };
          return clone;
        });
        setStatus("idle");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setErrorMessage(message);
        setStatus("error");
      } finally {
        abortRef.current = null;
      }
    },
    [messages]
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setStatus("idle");
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
    setToolCalls([]);
    setStatus("idle");
    setErrorMessage(undefined);
  }, []);

  return { messages, toolCalls, status, errorMessage, send, cancel, reset };
}

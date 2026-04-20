"use client";

import * as React from "react";
import { Send, Sparkles, Square } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = {
  role: "user" | "assistant";
  content: string;
  tools?: Array<{ name: string; result: Record<string, unknown> }>;
};

const QUICK_PROMPTS: Array<{ label: string; prompt: string }> = [
  { label: "BTC Brief", prompt: "Give me a 4-hour brief on BTC: trend, key levels, risk." },
  { label: "Screen movers", prompt: "Screen today's biggest movers across crypto and equities." },
  { label: "Portfolio read", prompt: "Read my paper portfolio and flag concentration risk." },
  { label: "Draft BTC order", prompt: "Draft a long BTC at market for 0.05 with a 2% stop." },
  { label: "Alert idea", prompt: "Draft a useful alert for ETH-USD." },
];

export function AssistantPanel() {
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [input, setInput] = React.useState("");
  const [streaming, setStreaming] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(override?: string) {
    const text = (override ?? input).trim();
    if (!text || streaming) return;

    const history: Msg[] = [...messages, { role: "user", content: text }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/v1/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error(`assistant_error_${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";
        for (const frame of frames) {
          const eventLine = frame.match(/^event: (.+)$/m)?.[1];
          const dataLine = frame.match(/^data: (.+)$/m)?.[1];
          if (!eventLine || !dataLine) continue;
          try {
            const payload = JSON.parse(dataLine) as { data: string };
            if (eventLine === "token") appendToken(payload.data);
            else if (eventLine === "tool") appendTool(payload.data);
            else if (eventLine === "error") replaceLast(`Error: ${payload.data}`);
          } catch {
            // ignore malformed frame
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      replaceLast(`Error: ${err instanceof Error ? err.message : "unknown"}`);
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function appendToken(chunk: string) {
    setMessages((m) => {
      const next = [...m];
      const last = next[next.length - 1];
      if (last?.role === "assistant") {
        next[next.length - 1] = { ...last, content: last.content + chunk };
      }
      return next;
    });
  }

  function appendTool(raw: string) {
    try {
      const parsed = JSON.parse(raw) as { name: string; result: Record<string, unknown> };
      setMessages((m) => {
        const next = [...m];
        const last = next[next.length - 1];
        if (last?.role === "assistant") {
          next[next.length - 1] = { ...last, tools: [...(last.tools ?? []), parsed] };
        }
        return next;
      });
    } catch {
      // ignore
    }
  }

  function replaceLast(content: string) {
    setMessages((m) => {
      const next = [...m];
      next[next.length - 1] = { role: "assistant", content };
      return next;
    });
  }

  function stop() {
    abortRef.current?.abort();
    setStreaming(false);
  }

  return (
    <div className="flex h-full min-h-0 flex-col border border-mute-10">
      <header className="flex items-center justify-between border-b border-mute-10 px-4 py-2">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-caps">
          <Sparkles className="size-3 text-accent" />
          Assistant · Claude Sonnet 4.6
        </div>
        {streaming && (
          <button
            onClick={stop}
            className="flex items-center gap-1.5 border border-mute-20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-caps hover:border-accent hover:text-accent"
          >
            <Square className="size-3" />
            Stop
          </button>
        )}
      </header>

      <div className="flex-1 overflow-auto scrollbar-thin">
        {messages.length === 0 && (
          <div className="p-6">
            <div className="eyebrow mb-2">Start</div>
            <p className="font-mono text-[11px] uppercase leading-[1.8] tracking-caps text-mute-50">
              Ask anything about a symbol, request a screen, draft an order, or plan an alert. The
              assistant drafts. Humans confirm every mutation.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q.label}
                  onClick={() => send(q.prompt)}
                  className="border border-mute-20 px-3 py-1.5 font-mono text-[10px] uppercase tracking-caps text-mute-70 hover:border-accent hover:text-accent"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-0">
          {messages.map((m, i) => (
            <MessageRow key={i} msg={m} streaming={streaming && i === messages.length - 1} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-end gap-2 border-t border-mute-10 p-3"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={2}
          placeholder="Message the assistant…"
          className="flex-1 resize-none border border-mute-20 bg-transparent px-3 py-2 font-mono text-[12px] placeholder:text-mute-40 focus:border-accent focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="flex h-10 w-10 items-center justify-center bg-accent text-accent-ink disabled:opacity-40"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}

function MessageRow({ msg, streaming }: { msg: Msg; streaming: boolean }) {
  return (
    <div className="border-b border-mute-6 p-5">
      <div className="eyebrow mb-2">{msg.role === "user" ? "You" : "Xake"}</div>
      <div
        className={cn(
          "whitespace-pre-wrap break-words border-l-2 pl-3 font-sans text-[14px] leading-[1.7]",
          msg.role === "user" ? "border-mute-20 text-fg/80" : "border-accent text-fg",
        )}
      >
        {msg.content || (streaming ? <BlinkingCursor /> : "")}
      </div>
      {msg.tools && msg.tools.length > 0 && (
        <div className="mt-3 space-y-2">
          {msg.tools.map((t, i) => (
            <ToolCallChip key={i} name={t.name} result={t.result} />
          ))}
        </div>
      )}
    </div>
  );
}

function ToolCallChip({ name, result }: { name: string; result: Record<string, unknown> }) {
  const [open, setOpen] = React.useState(false);
  const ok = result?.ok !== false;
  return (
    <div className="border border-mute-10">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 font-mono text-[10px] uppercase tracking-caps hover:bg-mute-4"
      >
        <span className="flex items-center gap-2">
          <span className={cn("inline-block size-1.5", ok ? "bg-accent" : "bg-down")} />
          Tool · {name}
        </span>
        <span className="text-mute-50">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <pre className="max-h-56 overflow-auto border-t border-mute-6 bg-mute-2 p-3 font-mono text-[10px] leading-[1.6] text-fg/80 scrollbar-thin">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

function BlinkingCursor() {
  return <span className="inline-block h-4 w-2 animate-void-pulse bg-accent align-middle" />;
}

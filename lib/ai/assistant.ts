import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/config/env";
import { anthropicToolDefs, tools } from "./tools";

type MessageParam = Anthropic.MessageParam;
type ToolResultBlockParam = Anthropic.ToolResultBlockParam;
type ToolUseBlock = Anthropic.ToolUseBlock;

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}

export type AssistantEvent =
  | { type: "token"; data: string }
  | { type: "tool"; data: string }
  | { type: "done"; data: string }
  | { type: "error"; data: string };

const SYSTEM_PROMPT = `You are the XAKE assistant — a senior market analyst inside a disciplined, paper-trading cockpit.

Tools are your eyes. Use them whenever you need a number:
- get_quote for current bid/ask/last.
- get_indicators for trend reads (SMA, EMA, RSI).
- get_orderbook for depth checks.
- screen_instruments to hunt movers.
- list_watchlist or portfolio_summary for the user's state.
- draft_order and draft_alert when the user asks for an action — these do NOT execute, humans confirm.

Rules:
- Never fabricate numbers. If a tool fails, say so and suggest what would work.
- Be concise. Favour short paragraphs and small tables over long prose.
- Always include a brief rationale with any draft_order or draft_alert call.
- Operate strictly in the paper environment. Never pretend to execute live trades.`;

const MAX_TOOL_ITERATIONS = 6;

export async function* streamAssistant(
  history: AssistantMessage[],
  accountId: string,
): AsyncGenerator<AssistantEvent> {
  const cfg = env();
  if (!cfg.ANTHROPIC_API_KEY) {
    yield* stubStream(history);
    return;
  }

  const client = new Anthropic({ apiKey: cfg.ANTHROPIC_API_KEY });
  const toolDefs = anthropicToolDefs();
  const messages: MessageParam[] = history.map((m) => ({ role: m.role, content: m.content }));

  const models = [cfg.ANTHROPIC_MODEL, cfg.ANTHROPIC_FALLBACK_MODEL];

  for (let iter = 0; iter < MAX_TOOL_ITERATIONS; iter++) {
    let modelIndex = 0;
    let response: Anthropic.Message | undefined;
    let lastErr: unknown;

    while (modelIndex < models.length && !response) {
      try {
        const stream = client.messages.stream({
          model: models[modelIndex],
          max_tokens: 1536,
          system: SYSTEM_PROMPT,
          tools: toolDefs as never,
          messages,
        });
        for await (const ev of stream) {
          if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
            yield { type: "token", data: ev.delta.text };
          }
        }
        response = await stream.finalMessage();
      } catch (err) {
        lastErr = err;
        modelIndex++;
      }
    }

    if (!response) {
      yield {
        type: "error",
        data: lastErr instanceof Error ? lastErr.message : "assistant_failed",
      };
      return;
    }

    const toolUses = response.content.filter((b): b is ToolUseBlock => b.type === "tool_use");
    if (toolUses.length === 0) {
      yield { type: "done", data: "" };
      return;
    }

    messages.push({ role: "assistant", content: response.content });

    const toolResults: ToolResultBlockParam[] = [];
    for (const use of toolUses) {
      const tool = tools.find((t) => t.name === use.name);
      if (!tool) {
        const payload = { ok: false, error: `unknown_tool:${use.name}` };
        yield { type: "tool", data: JSON.stringify({ name: use.name, result: payload }) };
        toolResults.push({
          type: "tool_result",
          tool_use_id: use.id,
          content: JSON.stringify(payload),
          is_error: true,
        });
        continue;
      }

      const parsed = tool.input.safeParse(use.input);
      if (!parsed.success) {
        const payload = { ok: false, error: parsed.error.message };
        yield { type: "tool", data: JSON.stringify({ name: use.name, result: payload }) };
        toolResults.push({
          type: "tool_result",
          tool_use_id: use.id,
          content: JSON.stringify(payload),
          is_error: true,
        });
        continue;
      }

      try {
        const result = await tool.run(parsed.data, accountId);
        yield { type: "tool", data: JSON.stringify({ name: use.name, result }) };
        toolResults.push({
          type: "tool_result",
          tool_use_id: use.id,
          content: JSON.stringify(result),
        });
      } catch (err) {
        const payload = { ok: false, error: err instanceof Error ? err.message : "tool_failed" };
        yield { type: "tool", data: JSON.stringify({ name: use.name, result: payload }) };
        toolResults.push({
          type: "tool_result",
          tool_use_id: use.id,
          content: JSON.stringify(payload),
          is_error: true,
        });
      }
    }

    messages.push({ role: "user", content: toolResults });
  }

  yield { type: "error", data: "Tool loop depth exceeded." };
}

async function* stubStream(
  history: AssistantMessage[],
): AsyncGenerator<AssistantEvent> {
  const last = history[history.length - 1]?.content ?? "";
  const reply = `Assistant stub — no ANTHROPIC_API_KEY set.

You said: "${last.slice(0, 240)}"

Set ANTHROPIC_API_KEY to enable Claude with tool calls (quotes, indicators, orderbook, screens, portfolio).`;
  for (const ch of reply) {
    await new Promise((r) => setTimeout(r, 5));
    yield { type: "token", data: ch };
  }
  yield { type: "done", data: "" };
}

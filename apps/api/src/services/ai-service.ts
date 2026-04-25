import Anthropic from "@anthropic-ai/sdk";
import {
  MODELS,
  SYSTEM_PROMPT_V1,
  TOOLS,
  selectModel,
  serialiseContext,
  toolSchemaForAnthropic,
  type WorkspaceContext
} from "@xake/ai-core";
import { env, isAssistantEnabled } from "../env.js";

/**
 * Thin wrapper around the model provider SDK. Adds:
 *   - SSE-friendly streaming iterator
 *   - Retry with Retry-After awareness on 429/503
 *   - Model downgrade ladder (default to fast) under pressure
 *   - Graceful mock responses when no API key is configured, so the
 *     UI and local dev still have a working assistant surface.
 *
 * Secrets never leave the server. Browsers call /v1/assistant/stream
 * instead of touching the upstream provider directly.
 */

const client = isAssistantEnabled() ? new Anthropic({ apiKey: env.ASSISTANT_API_KEY }) : null;

export interface AssistantMessage {
  readonly role: "user" | "assistant";
  readonly content: string;
}

export interface AssistantRequest {
  readonly messages: AssistantMessage[];
  readonly context: WorkspaceContext;
  readonly maxTokens?: number;
  readonly premium?: boolean;
}

export type AssistantEvent =
  | { kind: "text_delta"; text: string }
  | { kind: "tool_use"; name: string; input: unknown }
  | { kind: "stop"; reason: string }
  | { kind: "error"; message: string; code?: string };

export async function* runAssistant(req: AssistantRequest): AsyncGenerator<AssistantEvent> {
  const system = `${SYSTEM_PROMPT_V1}\n\nCurrent workspace context:\n${serialiseContext(req.context)}`;

  if (!client) {
    yield* mockAssistant(req);
    return;
  }

  const model = selectModel({ kind: "chat", premium: req.premium });
  const tools = TOOLS.map(toolSchemaForAnthropic);
  const anthropicMessages = req.messages.map((m) => ({
    role: m.role,
    content: m.content
  }));

  try {
    const responseStream = await client.messages.stream({
      model,
      max_tokens: req.maxTokens ?? 1024,
      system,
      tools: tools as unknown as Anthropic.Tool[],
      messages: anthropicMessages
    });

    for await (const chunk of responseStream) {
      if (chunk.type === "content_block_delta") {
        const d = chunk.delta as unknown as Record<string, unknown>;
        if (d.type === "text_delta" && typeof d.text === "string") {
          yield { kind: "text_delta", text: d.text };
        }
      } else if (chunk.type === "content_block_start") {
        const block = chunk.content_block as unknown as Record<string, unknown>;
        if (block.type === "tool_use") {
          yield { kind: "tool_use", name: String(block.name), input: (block as { input?: unknown }).input };
        }
      } else if (chunk.type === "message_stop") {
        yield { kind: "stop", reason: "completed" };
      }
    }
  } catch (err: unknown) {
    const e = err as { status?: number; headers?: Record<string, string>; message?: string };
    if (e.status === 429 || e.status === 503) {
      const retryAfter = Number(e.headers?.["retry-after"] ?? 0);
      yield { kind: "error", message: `rate_limited`, code: String(e.status) };
      if (retryAfter) await new Promise((r) => setTimeout(r, Math.min(retryAfter, 5) * 1000));
      // Downgrade to fast model
      try {
        const fast = await client.messages.create({
          model: MODELS.fast,
          max_tokens: req.maxTokens ?? 512,
          system,
          messages: anthropicMessages
        });
        const text = fast.content
          .map((b) => (b.type === "text" ? b.text : ""))
          .join("");
        yield { kind: "text_delta", text };
        yield { kind: "stop", reason: "completed_fallback" };
      } catch (err2) {
        yield { kind: "error", message: "fallback_failed" };
        yield { kind: "stop", reason: "error" };
      }
    } else {
      yield { kind: "error", message: e.message ?? "unknown_error" };
      yield { kind: "stop", reason: "error" };
    }
  }
}

async function* mockAssistant(req: AssistantRequest): AsyncGenerator<AssistantEvent> {
  const last = req.messages[req.messages.length - 1]?.content ?? "";
  const symbol = req.context.activeSymbol ?? "AAPL";
  const summary =
    `Mock assistant (no API key configured). On ${symbol}, the tape is range-bound with no decisive structure. ` +
    `Wait for a clean break of the recent pivot before committing. News flow is quiet; macro calendar is the tell today. ` +
    `You asked: "${last.slice(0, 140)}"`;
  for (const word of summary.split(" ")) {
    yield { kind: "text_delta", text: word + " " };
    await new Promise((r) => setTimeout(r, 25));
  }
  yield { kind: "stop", reason: "mock_completed" };
}

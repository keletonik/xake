import { z } from "zod";

/**
 * Tools the assistant may call. Tool execution is server-side.
 * A tool call never mutates trading state directly — the most
 * consequential tools (draft_paper_order, suggest_alert, build_watchlist)
 * return *drafts* that surface in the UI for user confirmation.
 */

export const SearchInstrumentsInput = z.object({
  query: z.string().min(1).max(120),
  assetClass: z.enum(["equity", "fx", "crypto", "futures", "index"]).optional(),
  limit: z.number().int().positive().max(50).default(10)
});
export type SearchInstrumentsInputT = z.infer<typeof SearchInstrumentsInput>;

export const SummariseNewsInput = z.object({
  symbols: z.array(z.string()).min(1).max(10),
  lookbackHours: z.number().int().positive().max(168).default(24)
});
export type SummariseNewsInputT = z.infer<typeof SummariseNewsInput>;

export const BuildWatchlistInput = z.object({
  theme: z.string().min(2).max(120),
  horizon: z.enum(["intraday", "swing", "position"]).default("swing"),
  targetCount: z.number().int().min(3).max(30).default(10)
});
export type BuildWatchlistInputT = z.infer<typeof BuildWatchlistInput>;

export const SuggestAlertInput = z.object({
  symbol: z.string(),
  setup: z.string().min(3).max(500)
});
export type SuggestAlertInputT = z.infer<typeof SuggestAlertInput>;

export const DraftPaperOrderInput = z.object({
  symbol: z.string(),
  side: z.enum(["buy", "sell"]),
  type: z.enum(["market", "limit"]),
  quantity: z.number().positive(),
  limitPrice: z.number().positive().optional(),
  reason: z.string().min(5).max(1000)
});
export type DraftPaperOrderInputT = z.infer<typeof DraftPaperOrderInput>;

export const ExplainChartInput = z.object({
  symbol: z.string(),
  timeframe: z.string().default("1h")
});
export type ExplainChartInputT = z.infer<typeof ExplainChartInput>;

export interface ToolDefinition {
  readonly name: string;
  readonly description: string;
  readonly input: z.ZodTypeAny;
}

export const TOOLS: ReadonlyArray<ToolDefinition> = [
  {
    name: "search_instruments",
    description:
      "Search the instrument catalogue by symbol, name, or asset class. Use when the user mentions an instrument that isn't already in context.",
    input: SearchInstrumentsInput
  },
  {
    name: "summarise_news",
    description:
      "Summarise market news for one or more instruments over a lookback window. Use when the user asks why a market moved or for a catch-up.",
    input: SummariseNewsInput
  },
  {
    name: "build_watchlist",
    description:
      "Produce a structured watchlist draft around a theme. The draft surfaces in the UI for the user to accept or edit — it is not auto-created.",
    input: BuildWatchlistInput
  },
  {
    name: "suggest_alert",
    description:
      "Suggest a price or percentage-move alert for a given setup. Returns an AlertDraft for user confirmation.",
    input: SuggestAlertInput
  },
  {
    name: "draft_paper_order",
    description:
      "Draft a paper order. The assistant can only propose a draft — the user must confirm via the order ticket before it is submitted.",
    input: DraftPaperOrderInput
  },
  {
    name: "explain_chart",
    description:
      "Describe the current chart: trend, notable levels, and any divergences or patterns visible in the timeframe.",
    input: ExplainChartInput
  }
];

export const toolSchemaForAnthropic = (tool: ToolDefinition) => ({
  name: tool.name,
  description: tool.description,
  input_schema: zodToJsonSchema(tool.input)
});

/**
 * Compact Zod → JSON Schema converter limited to the shapes we use.
 * We deliberately avoid pulling in zod-to-json-schema to keep the
 * package footprint small.
 */
export const zodToJsonSchema = (schema: z.ZodTypeAny): Record<string, unknown> => {
  const def: unknown = (schema as unknown as { _def: unknown })._def;
  const typeName = (def as { typeName?: string })?.typeName;

  switch (typeName) {
    case "ZodObject": {
      const shape = (def as { shape: () => Record<string, z.ZodTypeAny> }).shape();
      const properties: Record<string, unknown> = {};
      const required: string[] = [];
      for (const [k, v] of Object.entries(shape)) {
        properties[k] = zodToJsonSchema(v);
        const inner = (v as unknown as { _def: { typeName: string } })._def;
        if (inner.typeName !== "ZodOptional" && inner.typeName !== "ZodDefault") required.push(k);
      }
      return { type: "object", properties, required };
    }
    case "ZodString":
      return { type: "string" };
    case "ZodNumber":
      return { type: "number" };
    case "ZodBoolean":
      return { type: "boolean" };
    case "ZodArray":
      return {
        type: "array",
        items: zodToJsonSchema((def as { type: z.ZodTypeAny }).type)
      };
    case "ZodEnum":
      return { type: "string", enum: (def as { values: string[] }).values };
    case "ZodOptional":
      return zodToJsonSchema((def as { innerType: z.ZodTypeAny }).innerType);
    case "ZodDefault":
      return zodToJsonSchema((def as { innerType: z.ZodTypeAny }).innerType);
    default:
      return {};
  }
};

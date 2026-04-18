import { Badge, Card, CardDescription, CardMeta, CardTitle, SectionHeader, Separator } from "@xake/ui";

export const metadata = { title: "Features — XAKE" };

const FEATURES = [
  {
    group: "Data",
    items: [
      { title: "Normalised provider abstraction", note: "MarketDataProvider, NewsProvider, MacroCalendarProvider, PortfolioSource — one contract per source type." },
      { title: "Feed-class stamping", note: "Every quote carries `source`, `feedClass`, `venue`, `ageMs`. No more invisible delayed prices." },
      { title: "Mock + Coinbase live", note: "Deterministic mock always available; Coinbase public WS behind a feature flag for real-time crypto." },
      { title: "Stale-feed detection", note: "Each quote and chart surface shows age and staleness. Badges are unmissable." }
    ]
  },
  {
    group: "Decisions",
    items: [
      { title: "Chart workspace", note: "Lightweight Charts with candle/line/area. Timeframe, instrument, chart-type switchers." },
      { title: "Market explorer", note: "Search, filter by asset class, preview drawer, add-to-watchlist." },
      { title: "Watchlists", note: "Create, pin, tag, annotate. Starter drafts from the assistant." },
      { title: "Alerts", note: "Price, percentage, watchlist conditions. Hash-based duplicate prevention. Cooldowns." }
    ]
  },
  {
    group: "Practice",
    items: [
      { title: "Deterministic paper engine", note: "Validated drafts, slippage, buying-power enforcement, limit crossing, unit tests." },
      { title: "Event-sourced ledger", note: "Orders, fills, positions, balances reconcile from the ledger." },
      { title: "Portfolio", note: "Cash, equity, realised/unrealised P&L, order and fill history, reset flow." }
    ]
  },
  {
    group: "AI",
    items: [
      { title: "Claude Sonnet 4.6 co-pilot", note: "Server-side integration. SSE streaming. Haiku fallback on pressure." },
      { title: "Six structured tools", note: "search_instruments, summarise_news, build_watchlist, suggest_alert, draft_paper_order, explain_chart." },
      { title: "Draft-confirm gating", note: "Every mutating tool returns a draft card. User confirms via the standard validated API." },
      { title: "Prompt caching ready", note: "System prompt and tool schemas structured for cache-control once Anthropic cache is enabled." }
    ]
  },
  {
    group: "Workspace",
    items: [
      { title: "App shell", note: "Topbar, rail, main, docked assistant, status footer. One layout, every surface." },
      { title: "Themes", note: "Dark (default), darker (low-light), light/system. Flash-free bootstrap." },
      { title: "Command palette", note: "⌘K jumps to any surface or opens any chart." },
      { title: "Paper banner", note: "Always visible. Environment is never ambiguous." }
    ]
  },
  {
    group: "Platform",
    items: [
      { title: "Deploys to Vercel and Replit", note: "Same codebase, platform-specific adapters." },
      { title: "Postgres schema + migrations", note: "Ready to swap the in-memory store. Row-level security designed in." },
      { title: "Observability hooks", note: "Platform adapter for Console / OTel / Sentry. Event and timing primitives." }
    ]
  }
];

export default function FeaturesPage() {
  return (
    <div style={{ padding: "64px 28px" }}>
      <div className="mkt-container">
        <SectionHeader
          eyebrow="Product"
          title="Every surface, honestly listed"
          description="A feature inventory you can audit. No aspirational claims. No roadmap items masquerading as shipped features."
        />
        {FEATURES.map((g) => (
          <section key={g.group} style={{ marginBottom: "var(--space-10)" }}>
            <h2 className="xake-micro-label" style={{ color: "var(--colour-accent)", marginBottom: "var(--space-3)" }}>{g.group}</h2>
            <div className="mkt-grid">
              {g.items.map((i) => (
                <Card key={i.title}>
                  <CardMeta>{g.group}</CardMeta>
                  <CardTitle>{i.title}</CardTitle>
                  <CardDescription>{i.note}</CardDescription>
                </Card>
              ))}
            </div>
            <Separator />
          </section>
        ))}

        <div style={{ display: "flex", gap: 10 }}>
          <Badge tone="warning">Paper environment only</Badge>
          <Badge tone="info">Not a licensed broker</Badge>
        </div>
      </div>
    </div>
  );
}

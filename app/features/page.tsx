import Link from "next/link";

const groups: Array<{
  heading: string;
  items: Array<{ title: string; body: string }>;
}> = [
  {
    heading: "Markets",
    items: [
      {
        title: "32 symbols across 7 asset classes",
        body: "Crypto, equities, indices, FX, futures, commodities, sample options. Deterministic mock feed for demo, licensed feed slots for production.",
      },
      {
        title: "Level-2 orderbook",
        body: "15 levels of depth each side, size and order-count per level. Depth chart visualises bid/ask skew. Spread and mid price always visible.",
      },
      {
        title: "Tick-size precision",
        body: "Every instrument carries its own tick, lot, margin factor and session. Prices render to the correct precision, not a hardcoded default.",
      },
    ],
  },
  {
    heading: "Charting",
    items: [
      {
        title: "Candles, line, area, bars",
        body: "TradingView Lightweight Charts wrapped with XAKE tokens. Chart-type switcher, crosshair, auto-fit, tabular-number axis.",
      },
      {
        title: "Indicator panel",
        body: "SMA, EMA, Bollinger Bands, RSI, MACD histogram. Stack and toggle without reloading. All computed client-side from the candle stream.",
      },
      {
        title: "Seven timeframes",
        body: "1m, 5m, 15m, 1h, 4h, 1d, 1w. Server generates deterministic candles at each interval so demo data is reproducible.",
      },
    ],
  },
  {
    heading: "Execution (paper)",
    items: [
      {
        title: "Market and limit orders",
        body: "Market fills with 2 bps adverse slippage. Limits match against live ticks. TIF GTC / IOC / FOK / DAY. Working orders visible and cancellable.",
      },
      {
        title: "Portfolio with P&L",
        body: "Weighted-average cost. Realised and unrealised P&L. Mark-to-last. Reset-to-cash button wipes the account cleanly.",
      },
      {
        title: "Alerts with cooldowns",
        body: "Price and percent-move triggers. SHA-1 deduped, per-alert cooldowns honoured. Firings evaluated on a five-minute cron.",
      },
    ],
  },
  {
    heading: "AI co-pilot",
    items: [
      {
        title: "Claude Sonnet 4.6",
        body: "Streamed via server-sent events with Haiku 4.5 fallback on any upstream error. Temperature configurable per account.",
      },
      {
        title: "Tool calling",
        body: "get_quote, screen_instruments, portfolio_summary, draft_order, draft_alert. The assistant never places orders directly; it drafts, humans confirm.",
      },
      {
        title: "Chart-aware",
        body: "Selected symbol, timeframe and indicator state are included in the system context so questions like 'is RSI overbought?' work without retyping.",
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="flex h-14 items-center justify-between border-b border-mute-10 px-6">
        <Link href="/" className="font-mono text-[10px] uppercase tracking-caps text-mute-50 hover:text-fg">
          ← Back
        </Link>
        <Link href="/app" className="bg-accent px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-caps text-accent-ink">
          Open cockpit
        </Link>
      </header>

      <section className="border-b border-mute-10 px-6 py-20">
        <div className="eyebrow">Features · everything shipping today</div>
        <h1 className="mt-3 font-sans text-[clamp(36px,5vw,72px)] font-light leading-[1] tracking-tightest">
          Built for operators. <em className="not-italic font-medium">Not tourists.</em>
        </h1>
      </section>

      {groups.map((g, gi) => (
        <section key={g.heading} className="border-b border-mute-10">
          <div className="px-6 py-8">
            <div className="eyebrow">Group · {String(gi + 1).padStart(2, "0")}</div>
            <h2 className="mt-2 font-sans text-[28px] font-medium tracking-crisp">{g.heading}</h2>
          </div>
          <div className="grid grid-cols-1 border-t border-mute-10 md:grid-cols-3">
            {g.items.map((f, i) => (
              <div
                key={f.title}
                className={`p-8 ${i !== 0 ? "border-t border-mute-10 md:border-l md:border-t-0" : ""}`}
              >
                <div className="eyebrow mb-3">Item · {String(i + 1).padStart(2, "0")}</div>
                <div className="font-sans text-[18px] font-medium leading-tight tracking-crisp">
                  {f.title}
                </div>
                <p className="mt-3 font-mono text-[11px] uppercase leading-[1.8] tracking-caps text-mute-50">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

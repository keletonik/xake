import Link from "next/link";
import { Wordmark, Monogram } from "@/components/ui/wordmark";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <TopNav />
      <Hero />
      <SampleRow />
      <ContextRow />
      <MarketsBreakdown />
      <TrustRow />
      <BottomRule />
    </div>
  );
}

function TopNav() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-mute-10 bg-bg/95 px-6 backdrop-blur">
      <Link href="/" className="flex items-center gap-2.5">
        <Monogram className="h-4 w-4" />
        <span className="text-[13px] font-black tracking-[0.28em]">XAKE</span>
      </Link>
      <nav className="hidden items-center gap-8 font-mono text-[11px] uppercase tracking-caps text-mute-70 md:flex">
        <Link href="/markets" className="hover:text-fg">Markets</Link>
        <Link href="/features" className="hover:text-fg">Features</Link>
        <Link href="/security" className="hover:text-fg">Security</Link>
        <Link href="/pricing" className="hover:text-fg">Pricing</Link>
        <Link href="/changelog" className="hover:text-fg">Changelog</Link>
      </nav>
      <div className="flex items-center gap-3">
        <Link
          href="/app"
          className="border border-mute-20 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-caps text-fg hover:border-accent hover:text-accent"
        >
          Sign in
        </Link>
        <Link
          href="/app"
          className="bg-accent px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-caps text-accent-ink hover:bg-accent/90"
        >
          Open cockpit
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative border-b border-mute-10 px-6 py-20 md:py-28">
      <div className="mx-auto grid max-w-[1600px] grid-cols-12 gap-0">
        <div className="col-span-12 flex flex-col justify-between gap-10 md:col-span-7">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-caps text-mute-50">
            <span className="pulse-dot" />
            Xake · Live markets · Mock feed
          </div>
          <div className="space-y-6">
            <div className="eyebrow">v1.1 / Void</div>
            <h1 className="font-sans text-[clamp(44px,6vw,96px)] font-light leading-[0.98] tracking-tightest">
              Every market.
              <br />
              <em className="not-italic font-medium">One cockpit.</em>
            </h1>
            <p className="max-w-2xl font-mono text-[12px] uppercase leading-[1.8] tracking-caps text-mute-50">
              Crypto, equities, FX, indices, futures, commodities, options. Depth-of-book charting,
              an AI co-pilot that drafts trades humans confirm, and a paper engine that never lies.
              Ship trades you meant to take.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/app"
              className="flex items-center gap-2 bg-accent px-6 py-3.5 font-mono text-[11px] uppercase tracking-caps text-accent-ink hover:bg-accent/90"
            >
              Open the cockpit
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/features"
              className="flex items-center gap-2 border border-mute-20 px-6 py-3.5 font-mono text-[11px] uppercase tracking-caps hover:border-accent hover:text-accent"
            >
              See every feature
            </Link>
            <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-caps text-mute-50">
              <span>32 Symbols</span>
              <span>7 Asset classes</span>
              <span>Paper mode</span>
            </div>
          </div>
        </div>

        <div className="col-span-12 mt-12 flex items-center justify-center border-l border-mute-10 px-10 md:col-span-5 md:mt-0">
          <Wordmark className="w-full max-w-[560px]" />
        </div>
      </div>
    </section>
  );
}

function SampleRow() {
  return (
    <section className="grid grid-cols-1 border-b border-mute-10 md:grid-cols-3">
      <SampleCell label="Monogram">
        <Monogram className="h-14 w-14" />
      </SampleCell>
      <SampleCell label="App icon · iOS" className="border-t border-mute-10 md:border-l md:border-t-0">
        <div className="flex h-16 w-16 items-center justify-center bg-accent">
          <Monogram className="h-9 w-9" fill="#000" />
        </div>
      </SampleCell>
      <SampleCell label="Compact lockup" className="border-t border-mute-10 md:border-l md:border-t-0">
        <div className="flex items-center gap-3">
          <Monogram className="h-5 w-5" />
          <span className="font-sans text-[20px] font-black tracking-[0.12em]">XAKE</span>
          <span className="pulse-dot" />
        </div>
      </SampleCell>
    </section>
  );
}

function SampleCell({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex min-h-[200px] flex-col justify-between p-8 ${className ?? ""}`}>
      <div className="eyebrow">{label}</div>
      <div className="flex flex-1 items-center justify-center">{children}</div>
      <div />
    </div>
  );
}

function ContextRow() {
  return (
    <section className="grid grid-cols-1 border-b border-mute-10 md:grid-cols-3">
      <div className="border-b border-mute-10 p-8 md:border-b-0 md:border-r">
        <div className="eyebrow mb-5">Trade ticket</div>
        <MiniTicket />
      </div>
      <div className="border-b border-mute-10 p-8 md:border-b-0 md:border-r">
        <div className="eyebrow mb-5">Symbol · Chart</div>
        <MiniChart symbol="BTC / USD" price="96,241" delta="+0.64% · +612.40" />
      </div>
      <div className="p-8">
        <div className="eyebrow mb-5">AI co-pilot</div>
        <MiniAssistant />
      </div>
    </section>
  );
}

function MiniTicket() {
  return (
    <div className="border-t border-mute-10 pt-4 font-mono">
      <div className="mb-4 flex items-center gap-2">
        <Monogram className="h-4 w-4" />
        <span className="font-sans text-[14px] font-black tracking-crisp">XAKE</span>
      </div>
      {[
        ["Symbol", "AAPL"],
        ["Side", "BUY"],
        ["Qty", "100"],
        ["Bid / Ask", "247.31 / 247.34"],
        ["Est. cost", "$24,734.00"],
      ].map(([k, v]) => (
        <div
          key={k}
          className="flex justify-between border-b border-mute-6 py-1.5 text-[11px] uppercase tracking-caps"
        >
          <span className="text-mute-50">{k}</span>
          <span className="text-fg">{v}</span>
        </div>
      ))}
      <button className="mt-4 w-full bg-accent py-3 font-mono text-[11px] font-semibold uppercase tracking-caps text-accent-ink">
        Execute (paper)
      </button>
    </div>
  );
}

function MiniChart({
  symbol,
  price,
  delta,
}: {
  symbol: string;
  price: string;
  delta: string;
}) {
  return (
    <div className="border-t border-mute-10 pt-4 font-mono">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-sans text-[14px] font-bold tracking-crisp">{symbol}</span>
        <span className="text-[18px] font-medium">{price}</span>
      </div>
      <div className="text-[11px] uppercase tracking-caps text-accent">↑ {delta}</div>
      <div className="mt-3 h-20">
        <svg viewBox="0 0 300 80" preserveAspectRatio="none" className="h-full w-full">
          <path
            d="M 0 60 L 20 55 L 40 58 L 60 48 L 80 52 L 100 38 L 120 42 L 140 30 L 160 34 L 180 22 L 200 26 L 220 18 L 240 22 L 260 14 L 280 18 L 300 10 L 300 80 L 0 80 Z"
            fill="#FF006E"
            opacity="0.12"
          />
          <path
            d="M 0 60 L 20 55 L 40 58 L 60 48 L 80 52 L 100 38 L 120 42 L 140 30 L 160 34 L 180 22 L 200 26 L 220 18 L 240 22 L 260 14 L 280 18 L 300 10"
            fill="none"
            stroke="#FF006E"
            strokeWidth="1.5"
          />
          <circle cx="300" cy="10" r="3" fill="#FF006E" />
        </svg>
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-caps text-mute-50">
        <span>Xake · Markets</span>
        <span className="text-accent">Live</span>
      </div>
    </div>
  );
}

function MiniAssistant() {
  return (
    <div className="border-t border-mute-10 pt-4 font-mono">
      <div className="mb-3 flex items-center gap-2">
        <span className="pulse-dot" />
        <span className="text-[11px] uppercase tracking-caps text-mute-70">Claude · Sonnet 4.6</span>
      </div>
      <div className="space-y-3 text-[11px] leading-[1.7] text-fg/80">
        <p className="text-mute-50">You</p>
        <p className="border-l-2 border-mute-10 pl-3">
          Short BTC if we lose 95k support. Sanity check?
        </p>
        <p className="mt-4 text-mute-50">Xake</p>
        <p className="border-l-2 border-accent pl-3">
          95,000 held twice in the last 48h. RSI 62 on 4h. I can draft a conditional short with
          0.05 BTC at 94,750, 1% stop, 3:1 R. Confirm to place.
        </p>
      </div>
      <button className="mt-4 w-full border border-accent py-3 font-mono text-[11px] font-semibold uppercase tracking-caps text-accent hover:bg-accent hover:text-accent-ink">
        Review draft
      </button>
    </div>
  );
}

function MarketsBreakdown() {
  const classes = [
    { name: "Crypto", count: 8, note: "BTC ETH SOL XRP DOGE ADA AVAX LINK" },
    { name: "Equities", count: 8, note: "AAPL MSFT NVDA TSLA AMZN META GOOGL AMD" },
    { name: "Indices", count: 4, note: "SPY QQQ DIA IWM" },
    { name: "FX", count: 5, note: "EUR GBP JPY AUD CAD majors" },
    { name: "Futures", count: 4, note: "ES NQ CL GC continuous" },
    { name: "Commodities", count: 3, note: "XAU XAG WTI spot" },
    { name: "Options", count: 2, note: "Sample weeklies" },
  ];
  return (
    <section className="grid grid-cols-1 border-b border-mute-10 md:grid-cols-2 lg:grid-cols-4">
      {classes.map((c, i) => (
        <div
          key={c.name}
          className={`p-8 ${i !== 0 ? "border-t border-mute-10 lg:border-t-0 lg:border-l" : ""} ${i % 4 !== 0 && i !== 0 ? "lg:border-l" : ""}`}
        >
          <div className="eyebrow mb-4">{String(i + 1).padStart(2, "0")} · Asset class</div>
          <div className="flex items-baseline justify-between">
            <span className="text-[32px] font-medium tracking-crisp">{c.name}</span>
            <span className="font-mono text-[11px] uppercase tracking-caps text-accent">
              {c.count} Symbols
            </span>
          </div>
          <div className="mt-6 font-mono text-[10px] uppercase leading-[1.8] tracking-caps text-mute-50">
            {c.note}
          </div>
        </div>
      ))}
    </section>
  );
}

function TrustRow() {
  const items = [
    "No unlicensed realtime data in production.",
    "No fabricated brokerage execution.",
    "AI drafts. Humans confirm.",
    "Paper mode is always visually unmistakable.",
  ];
  return (
    <section className="grid grid-cols-1 border-b border-mute-10 md:grid-cols-4">
      {items.map((it, i) => (
        <div
          key={it}
          className={`p-8 ${i !== 0 ? "border-t border-mute-10 md:border-l md:border-t-0" : ""}`}
        >
          <div className="eyebrow mb-4">Rule · {String(i + 1).padStart(2, "0")}</div>
          <p className="font-sans text-[18px] font-light leading-tight tracking-crisp">{it}</p>
        </div>
      ))}
    </section>
  );
}

function BottomRule() {
  return (
    <footer className="grid grid-cols-1 gap-6 px-6 py-10 font-mono text-[10px] uppercase tracking-caps text-mute-40 md:grid-cols-3">
      <div>Xake · v1.1 · Void</div>
      <div className="text-center">Four directions · One winner</div>
      <div className="text-right">© {new Date().getFullYear()} Paper environment only</div>
    </footer>
  );
}

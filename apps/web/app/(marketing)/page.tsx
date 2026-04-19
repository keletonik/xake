import Link from "next/link";
import { Badge, Button, Card, CardDescription, CardMeta, CardTitle, SectionHeader, Separator } from "@xake/ui";
import { DemoCta } from "../_marketing/demo-cta";

export default function Landing() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-20)", paddingBottom: "var(--space-16)" }}>
      <section className="mkt-hero">
        <div className="mkt-hero__glow" aria-hidden />
        <div className="mkt-hero__inner">
          <span className="xake-micro-label" style={{ color: "var(--colour-accent)" }}>
            A premium trading cockpit
          </span>
          <h1 className="mkt-hero__display">
            Trade with edge,<br />not noise.
          </h1>
          <p className="mkt-hero__lede">
            XAKE is a dark, terminal-grade decision cockpit for market operators. Chart-first,
            modular, and wired to a Claude-powered co-pilot that drafts — you decide.
          </p>
          <div className="mkt-hero__ctas">
            <Link href="/app">
              <Button variant="primary" size="lg">Launch workspace</Button>
            </Link>
            <DemoCta size="lg" />
          </div>
          <div className="mkt-hero__proof">
            <Badge tone="warning" dot>Paper environment by default</Badge>
            <Badge tone="accent" dot>Claude Sonnet 4.6 co-pilot</Badge>
            <Badge tone="info">Not a licensed broker</Badge>
          </div>
        </div>
        <div className="mkt-hero__screenshot" aria-hidden>
          <div className="mkt-hero__screenshot-inner">
            <div className="mkt-hero__ticker"><span>AAPL</span><span className="xake-numeric">228.41</span><span style={{ color: "var(--colour-positive)" }}>+0.55%</span></div>
            <div className="mkt-hero__ticker"><span>NVDA</span><span className="xake-numeric">118.92</span><span style={{ color: "var(--colour-negative)" }}>−1.18%</span></div>
            <div className="mkt-hero__ticker"><span>BTC-USD</span><span className="xake-numeric">63,540.22</span><span style={{ color: "var(--colour-positive)" }}>+2.34%</span></div>
            <div className="mkt-hero__ticker"><span>ETH-USD</span><span className="xake-numeric">3,281.40</span><span style={{ color: "var(--colour-positive)" }}>+1.02%</span></div>
          </div>
        </div>
      </section>

      <section className="mkt-container">
        <SectionHeader
          eyebrow="Workspace"
          title="Every surface built for operators"
          description="Dashboard, markets, charts, watchlists, alerts, portfolio, paper ticket, and assistant — one cockpit, one design language."
        />
        <div className="mkt-grid">
          <ShowcaseCard
            eyebrow="Chart workspace"
            title="Lightweight Charts. Zero bloat."
            body="Candles, line, area. Timeframe switcher, instrument switcher, order overlays. A chart designed for decisions, not decoration."
          />
          <ShowcaseCard
            eyebrow="Market explorer"
            title="Search, filter, act."
            body="Unified instrument catalogue across equities, FX, and crypto. Live prices per row with provider and feed-class stamps."
          />
          <ShowcaseCard
            eyebrow="Watchlists"
            title="Lists of intent"
            body="Pin, tag, annotate. The assistant drafts starter lists around a theme — you keep the ones that earn their place."
          />
          <ShowcaseCard
            eyebrow="Alerts"
            title="Only the triggers that matter"
            body="Price, percentage, watchlist conditions. Duplicate hashes prevent noise. Cooldowns keep alerts useful."
          />
          <ShowcaseCard
            eyebrow="Paper engine"
            title="Practise discipline, not guesswork"
            body="Deterministic fills, slippage, buying-power enforcement. Positions and P&L reconcile from an event ledger."
          />
          <ShowcaseCard
            eyebrow="AI co-pilot"
            title="Drafts. Never autopilot."
            body="Claude Sonnet 4.6 analyses, summarises, and drafts. Every action you take is explicit, validated, and audited."
          />
        </div>
      </section>

      <Separator />

      <section className="mkt-container">
        <SectionHeader
          eyebrow="AI, properly wired"
          title="Co-pilot, not autopilot"
          description="Every draft the assistant produces passes schema validation server-side and surfaces in the UI as a card you explicitly accept."
        />
        <div className="mkt-grid mkt-grid--2">
          <Card>
            <CardMeta>Server-side only</CardMeta>
            <CardTitle>No browser-side API keys</CardTitle>
            <CardDescription>
              Claude runs in the Hono API layer. Streaming to the UI is SSE — the browser never touches Anthropic directly.
            </CardDescription>
          </Card>
          <Card>
            <CardMeta>Structured outputs</CardMeta>
            <CardTitle>Zod-validated drafts</CardTitle>
            <CardDescription>
              Watchlist, alert, order, and summary drafts are schema-checked before they ever reach the UI — and again when you accept them.
            </CardDescription>
          </Card>
          <Card>
            <CardMeta>Rate-limit aware</CardMeta>
            <CardTitle>Graceful downgrade</CardTitle>
            <CardDescription>
              When Anthropic is busy, the assistant honours `retry-after` and falls back from Sonnet to Haiku rather than stalling.
            </CardDescription>
          </Card>
          <Card>
            <CardMeta>Audited</CardMeta>
            <CardTitle>Every tool call recorded</CardTitle>
            <CardDescription>
              Conversation history and tool inputs/outputs persist to Postgres. Audit events capture every confirmed action.
            </CardDescription>
          </Card>
        </div>
      </section>

      <section className="mkt-container mkt-trust">
        <SectionHeader
          eyebrow="Transparency"
          title="What's real, what's not"
          description="We don't imply licensing we don't hold. Read the full register in docs/engineering/what-is-mocked.md."
        />
        <div className="mkt-trust__grid">
          <TrustRow label="Paper trading" state="Real" tone="positive" note="Deterministic engine, unit-tested, event-sourced ledger." />
          <TrustRow label="Mock market data" state="Real" tone="positive" note="Seeded, deterministic, stamped with source + feed class." />
          <TrustRow label="Coinbase crypto quotes" state="Real (flagged)" tone="info" note="Public WS, behind ENABLE_COINBASE_FEED." />
          <TrustRow label="Licensed equity real-time" state="Not shipped" tone="warning" note="Requires vendor contracts. V1.5+." />
          <TrustRow label="Live execution" state="Hard-disabled" tone="negative" note="Server rejects any non-paper order. Gated on licensing." />
          <TrustRow label="Assistant autonomy" state="None" tone="negative" note="Drafts only. Every action is user-confirmed." />
        </div>
      </section>

      <section className="mkt-container">
        <SectionHeader
          eyebrow="No sign-up required"
          title="Try demo trading"
          description="One click spins up an isolated demo account in your browser. $100,000 in virtual cash, the full workspace, the Claude co-pilot — nothing touches a real account. Your demo state lives on the server, scoped to your browser, clearly labelled throughout the app."
          actions={<DemoCta />}
        />
        <div className="mkt-grid mkt-grid--2" style={{ marginTop: "var(--space-4)" }}>
          <Card>
            <CardMeta>Isolated</CardMeta>
            <CardTitle>Your demo never mingles</CardTitle>
            <CardDescription>
              Each browser gets a stable demo id. Two tabs, two isolated demo portfolios. No shared state with other visitors.
            </CardDescription>
          </Card>
          <Card>
            <CardMeta>Reversible</CardMeta>
            <CardTitle>Exit cleanly any time</CardTitle>
            <CardDescription>
              Exit demo in Settings or from the banner. The demo id and cookie are wiped; no residual state follows you.
            </CardDescription>
          </Card>
          <Card>
            <CardMeta>Honest</CardMeta>
            <CardTitle>Demo mode is never hidden</CardTitle>
            <CardDescription>
              A persistent banner and status-rail badge confirm demo mode everywhere. You will not confuse it for a real account.
            </CardDescription>
          </Card>
          <Card>
            <CardMeta>Full-feature</CardMeta>
            <CardTitle>Every surface, same design</CardTitle>
            <CardDescription>
              Markets, charts, watchlists, alerts, portfolio, paper ticket, and the AI assistant are all live in demo mode.
            </CardDescription>
          </Card>
        </div>
      </section>

      <section className="mkt-container mkt-cta">
        <div className="mkt-cta__card">
          <h2>Ready to see the cockpit?</h2>
          <p>Paper environment is free. No credit card, no broker connection.</p>
          <div style={{ display: "inline-flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/app">
              <Button variant="primary" size="lg">Launch workspace</Button>
            </Link>
            <DemoCta />
          </div>
        </div>
      </section>
    </div>
  );
}

function ShowcaseCard({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <Card interactive>
      <CardMeta>{eyebrow}</CardMeta>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{body}</CardDescription>
    </Card>
  );
}

function TrustRow({ label, state, tone, note }: { label: string; state: string; tone: "positive" | "negative" | "warning" | "info"; note: string }) {
  return (
    <div className="mkt-trust__row">
      <span style={{ fontWeight: 500 }}>{label}</span>
      <Badge tone={tone}>{state}</Badge>
      <span style={{ color: "var(--colour-text-muted)", fontSize: "var(--text-dense)" }}>{note}</span>
    </div>
  );
}

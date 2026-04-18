import { Badge, SectionHeader, Separator } from "@xake/ui";

export const metadata = { title: "Changelog — XAKE" };

interface Entry {
  readonly tag: string;
  readonly date: string;
  readonly title: string;
  readonly items: string[];
  readonly tone: "accent" | "positive" | "info";
}

const ENTRIES: Entry[] = [
  {
    tag: "stage 7+",
    date: "latest",
    title: "Public site, auth, settings, Vercel target, polish",
    tone: "accent",
    items: [
      "Premium marketing site (landing, features, security, pricing, changelog) using the XAKE design language.",
      "Clerk authentication with a graceful demo-account fallback when keys are absent.",
      "Per-user preferences persisted through a new settings page.",
      "Platform adapters (@xake/platform): queue, cron, realtime, observability — one core, per-target glue.",
      "apps/api split: `app.ts` (pure Hono) + `server.ts` (standalone) — same app mounts at `apps/web/app/api/[[...path]]/route.ts` for Vercel.",
      "Polish primitives: Skeleton, PaperBanner, CommandPalette (⌘K).",
      "vercel.json with cron jobs for alert evaluation and provider health sweeps.",
      "docs/deployment/: local, vercel, replit, adapters. docs/engineering/release-audit.md."
    ]
  },
  {
    tag: "stages 3-6",
    date: "earlier",
    title: "Markets, charts, watchlists, alerts, portfolio, paper, assistant",
    tone: "positive",
    items: [
      "Provider abstraction with mock + Coinbase public WS adapter.",
      "Deterministic paper engine with validated drafts, slippage, limit crossing, buying-power enforcement.",
      "Alerts with SHA-1 dedupe hash and cooldowns.",
      "Claude assistant with SSE streaming, six structured tools, draft-confirm gating.",
      "Eight workspace pages: dashboard, markets, charts, watchlists, alerts, portfolio, paper, assistant."
    ]
  },
  {
    tag: "stage 2",
    date: "earlier",
    title: "Design system",
    tone: "info",
    items: [
      "Token system (colour, type, spacing, radii, shadows, motion).",
      "Three themes: dark, darker, light/system.",
      "Primitives: Button, Input, Badge, EnvBadge, Kbd, Panel, Toolbar, Card, SectionHeader, StatusBar, EmptyState, ErrorState, AppShell.",
      "Radix-backed: Tabs, Tooltip, Dialog, Toast."
    ]
  },
  {
    tag: "stage 0",
    date: "earlier",
    title: "Scaffold",
    tone: "info",
    items: [
      "pnpm workspace with apps/{web,api,worker} and packages/{ui,charts,data-core,trading-core,ai-core,analytics,config}.",
      "Paper environment pinned as default.",
      "README, STAGES, ARCHITECTURE."
    ]
  }
];

export default function ChangelogPage() {
  return (
    <div style={{ padding: "64px 28px" }}>
      <div className="mkt-container">
        <SectionHeader eyebrow="Changelog" title="What shipped" description="The honest log. Nothing listed here is aspirational." />
        {ENTRIES.map((e, i) => (
          <section key={e.tag} style={{ marginBottom: "var(--space-10)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "var(--space-2)" }}>
              <Badge tone={e.tone}>{e.tag}</Badge>
              <span className="xake-micro-label">{e.date}</span>
            </div>
            <h2 style={{ fontSize: "var(--text-h2)", margin: "0 0 var(--space-3)" }}>{e.title}</h2>
            <ul style={{ color: "var(--colour-text-secondary)", paddingLeft: 18, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
              {e.items.map((it, idx) => (
                <li key={idx}>{it}</li>
              ))}
            </ul>
            {i < ENTRIES.length - 1 ? <Separator /> : null}
          </section>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";

const tiers: Array<{
  name: string;
  price: string;
  perks: string[];
  cta: string;
  href: string;
  featured?: boolean;
}> = [
  {
    name: "Sandbox",
    price: "$0",
    perks: [
      "Full cockpit on mock market data",
      "Paper engine with weighted-average P&L",
      "Alerts with 5-minute cron",
      "Claude co-pilot (bring your own key)",
    ],
    cta: "Open cockpit",
    href: "/app",
  },
  {
    name: "Operator",
    price: "TBD",
    featured: true,
    perks: [
      "Licensed realtime crypto + US equities",
      "Persistent portfolio + order history",
      "Account and preferences",
      "Priority AI model access",
      "Saved chart layouts + workspaces",
    ],
    cta: "Notify me",
    href: "mailto:hello@xake.app",
  },
  {
    name: "Desk",
    price: "TBD",
    perks: [
      "Operator plus team seats",
      "Shared watchlists and alerts",
      "Role-based permissions",
      "Audit ledger export",
    ],
    cta: "Talk to us",
    href: "mailto:hello@xake.app",
  },
];

export default function PricingPage() {
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
        <div className="eyebrow">Pricing · honest</div>
        <h1 className="mt-3 font-sans text-[clamp(36px,5vw,72px)] font-light leading-[1] tracking-tightest">
          Pay for what is <em className="not-italic font-medium">actually licensed.</em>
        </h1>
        <p className="mt-6 max-w-2xl font-mono text-[11px] uppercase leading-[1.8] tracking-caps text-mute-50">
          Sandbox is free and will stay free. Paid tiers unlock only when the data we sell is data we
          legally hold.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3">
        {tiers.map((t, i) => (
          <div
            key={t.name}
            className={`flex flex-col gap-6 p-10 ${i !== 0 ? "border-t border-mute-10 md:border-l md:border-t-0" : ""} ${t.featured ? "bg-accent/5" : ""}`}
          >
            <div className="flex items-baseline justify-between">
              <span className="eyebrow">{t.name}</span>
              {t.featured && (
                <span className="bg-accent px-2 py-0.5 font-mono text-[9px] uppercase tracking-caps text-accent-ink">
                  Planned
                </span>
              )}
            </div>
            <div className="font-sans text-[48px] font-medium leading-none tracking-tightest">
              {t.price}
            </div>
            <ul className="space-y-2 font-mono text-[11px] uppercase tracking-caps text-mute-70">
              {t.perks.map((p) => (
                <li key={p} className="flex gap-2 before:content-['·'] before:text-accent">
                  {p}
                </li>
              ))}
            </ul>
            <Link
              href={t.href}
              className={`mt-auto px-4 py-3 text-center font-mono text-[11px] uppercase tracking-caps ${
                t.featured
                  ? "bg-accent text-accent-ink"
                  : "border border-mute-20 hover:border-accent hover:text-accent"
              }`}
            >
              {t.cta}
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}

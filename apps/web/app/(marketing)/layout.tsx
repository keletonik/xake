import type { ReactNode } from "react";
import Link from "next/link";
import { Badge, Button, ThemeToggle } from "@xake/ui";

const NAV = [
  { href: "/features", label: "Features" },
  { href: "/security", label: "Security" },
  { href: "/pricing", label: "Pricing" },
  { href: "/changelog", label: "Changelog" }
];

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header className="mkt-topbar">
        <Link href="/" className="mkt-brand">
          <span className="mkt-brand__mark" aria-hidden>◪</span>
          <span>XAKE</span>
          <Badge tone="accent">v0.x preview</Badge>
        </Link>
        <nav className="mkt-nav">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="mkt-nav__link">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mkt-actions">
          <ThemeToggle />
          <Link href="/app">
            <Button variant="primary">Open workspace</Button>
          </Link>
        </div>
      </header>
      <main style={{ flex: 1 }}>{children}</main>
      <footer className="mkt-footer">
        <div className="mkt-footer__grid">
          <div>
            <div className="mkt-brand">
              <span className="mkt-brand__mark" aria-hidden>◪</span>
              <span>XAKE</span>
            </div>
            <p style={{ color: "var(--colour-text-muted)", fontSize: "var(--text-dense)", maxWidth: 44 + "ch" }}>
              A premium trading cockpit for analysis and paper trading. Claude-powered co-pilot.
              No live-money execution until licensing is in place.
            </p>
          </div>
          <FooterCol title="Product" links={[
            { href: "/features", label: "Features" },
            { href: "/app", label: "Open workspace" },
            { href: "/app/assistant", label: "AI assistant" }
          ]} />
          <FooterCol title="Trust" links={[
            { href: "/security", label: "Security" },
            { href: "/pricing", label: "Pricing" },
            { href: "/changelog", label: "Changelog" }
          ]} />
          <FooterCol title="Reference" links={[
            { href: "/style-guide", label: "Style guide" },
            { href: "/components", label: "Components" }
          ]} />
        </div>
        <div className="mkt-footer__base">
          <span className="xake-micro-label">© XAKE · paper-trading platform · not a licensed broker</span>
          <span className="xake-micro-label">Built in Australia</span>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: Array<{ href: string; label: string }> }) {
  return (
    <div>
      <div className="xake-micro-label" style={{ marginBottom: 10 }}>{title}</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} style={{ color: "var(--colour-text-secondary)", fontSize: "var(--text-dense)" }}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

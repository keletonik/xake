import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardMeta,
  CardTitle,
  EnvBadge,
  Kbd,
  Separator,
  ThemeToggle
} from "@xake/ui";

export default function Home() {
  return (
    <div className="page" style={{ maxWidth: 1080 }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-4)"
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-3)" }}>
          <span
            style={{
              color: "var(--colour-accent)",
              fontFamily: "var(--font-mono)",
              fontSize: 18,
              fontWeight: 600
            }}
          >
            ◪
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              fontSize: "var(--text-dense)",
              letterSpacing: "var(--tracking-wide)"
            }}
          >
            XAKE
          </span>
          <Badge tone="accent">Stage 2</Badge>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-3)" }}>
          <EnvBadge env="paper" />
          <ThemeToggle />
        </div>
      </header>

      <section className="marketing-hero" style={{ paddingInline: 0, paddingTop: "var(--space-12)" }}>
        <span className="xake-micro-label" style={{ color: "var(--colour-accent)" }}>
          Stage 2 — design system
        </span>
        <h1 className="marketing-hero__display">Trade with edge, not noise.</h1>
        <p className="marketing-hero__lede">
          XAKE is a dark, terminal-grade trading cockpit. The Stage 2 release ships the token
          system, theme engine, and primitive library. Charts, alerts, paper trading, and the AI
          assistant land in later stages.
        </p>
        <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-3)" }}>
          <Button variant="primary" size="lg">
            Launch workspace
          </Button>
          <Button variant="secondary" size="lg">
            Try paper mode
          </Button>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
              color: "var(--colour-text-muted)",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-dense)"
            }}
          >
            or press <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </div>
      </section>

      <Separator />

      <section>
        <div className="marketing-grid">
          <Card interactive>
            <CardMeta>Design system</CardMeta>
            <CardTitle>Style guide</CardTitle>
            <CardDescription>
              Palette, type, spacing, radii, shadows, motion, and semantic colour rules — every
              token and how it earns its place.
            </CardDescription>
            <Link
              href="/style-guide"
              style={{
                marginTop: "var(--space-2)",
                color: "var(--colour-accent)",
                fontWeight: 500,
                fontSize: "var(--text-dense)"
              }}
            >
              Open style guide →
            </Link>
          </Card>

          <Card interactive>
            <CardMeta>Library</CardMeta>
            <CardTitle>Components</CardTitle>
            <CardDescription>
              Live previews of every primitive: buttons, inputs, panels, toolbars, dialogs,
              toasts, tabs, and the full status bar.
            </CardDescription>
            <Link
              href="/components"
              style={{
                marginTop: "var(--space-2)",
                color: "var(--colour-accent)",
                fontWeight: 500,
                fontSize: "var(--text-dense)"
              }}
            >
              Open components →
            </Link>
          </Card>

          <Card>
            <CardMeta>Next up</CardMeta>
            <CardTitle>Stage 3 — auth</CardTitle>
            <CardDescription>
              Clerk-branded sign-in, workspace model, RBAC roles, audit events. The shell starts
              carrying real users.
            </CardDescription>
          </Card>
        </div>
      </section>
    </div>
  );
}

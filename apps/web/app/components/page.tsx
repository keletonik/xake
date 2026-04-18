import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardMeta,
  CardTitle,
  EmptyState,
  EnvBadge,
  ErrorState,
  Input,
  Kbd,
  Panel,
  SectionHeader,
  Separator,
  StatusBar,
  StatusItem,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  ThemeToggle,
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator
} from "@xake/ui";
import { DialogDemo, ToastDemo, TooltipDemo } from "../_showcase/interactive";

export default function ComponentsPage() {
  return (
    <div className="page">
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-4)"
        }}
      >
        <div style={{ display: "inline-flex", gap: "var(--space-3)", alignItems: "center" }}>
          <a href="/" className="xake-micro-label" style={{ color: "var(--colour-accent)" }}>
            ← Home
          </a>
          <Badge tone="accent">Components</Badge>
        </div>
        <div style={{ display: "inline-flex", gap: "var(--space-3)", alignItems: "center" }}>
          <EnvBadge env="paper" />
          <ThemeToggle />
        </div>
      </header>

      <SectionHeader
        eyebrow="Stage 2 — primitives"
        title="Components showcase"
        description="Every primitive, rendered live against every theme. Toggle the theme at any time to verify contrast and hierarchy hold."
      />

      <section className="showcase-grid">
        <div className="showcase-cell">
          <span className="xake-micro-label">Button — variants</span>
          <div className="showcase-row">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="link">Link action</Button>
          </div>
          <div className="showcase-row">
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary">Default</Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
            <Button variant="secondary" disabled>
              Disabled
            </Button>
          </div>
        </div>

        <div className="showcase-cell">
          <span className="xake-micro-label">Input · Textarea</span>
          <Input placeholder="Search instruments (⌘K)" />
          <Input variant="mono" defaultValue="AAPL · NASDAQ" />
          <Textarea placeholder="Notes on this position…" rows={3} />
        </div>

        <div className="showcase-cell">
          <span className="xake-micro-label">Badge · Env · Kbd</span>
          <div className="showcase-row">
            <Badge>Neutral</Badge>
            <Badge tone="accent" dot>
              Focus
            </Badge>
            <Badge tone="positive" dot>
              Live
            </Badge>
            <Badge tone="negative" dot>
              Halted
            </Badge>
            <Badge tone="warning">Delayed</Badge>
            <Badge tone="info">News</Badge>
          </div>
          <div className="showcase-row">
            <EnvBadge env="paper" />
            <EnvBadge env="live" />
          </div>
          <div className="showcase-row">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
            <span style={{ color: "var(--colour-text-muted)" }}>command palette</span>
          </div>
        </div>

        <div className="showcase-cell">
          <span className="xake-micro-label">Tabs</span>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="positions">Positions</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <p style={{ color: "var(--colour-text-secondary)", margin: 0 }}>
                Account equity: <span className="xake-numeric">$12,458.30</span>
              </p>
            </TabsContent>
            <TabsContent value="positions">
              <p style={{ color: "var(--colour-text-secondary)", margin: 0 }}>No open positions.</p>
            </TabsContent>
            <TabsContent value="orders">
              <p style={{ color: "var(--colour-text-secondary)", margin: 0 }}>No working orders.</p>
            </TabsContent>
            <TabsContent value="activity">
              <p style={{ color: "var(--colour-text-secondary)", margin: 0 }}>
                Last sync <span className="xake-numeric">14:03:12</span>
              </p>
            </TabsContent>
          </Tabs>
        </div>

        <div className="showcase-cell">
          <span className="xake-micro-label">Dialog</span>
          <DialogDemo />
        </div>

        <div className="showcase-cell">
          <span className="xake-micro-label">Toast</span>
          <ToastDemo />
        </div>

        <div className="showcase-cell">
          <span className="xake-micro-label">Tooltip</span>
          <TooltipDemo />
        </div>
      </section>

      <Separator />

      <SectionHeader
        eyebrow="Surfaces"
        title="Panel · Toolbar · Card"
        description="Panels are the signature workstation surface. Toolbars sit above or inside; cards group related content inside a panel body."
      />

      <Panel
        title={
          <>
            <span>AAPL · NASDAQ</span>
            <Badge tone="warning">Delayed</Badge>
          </>
        }
        actions={
          <>
            <Button size="sm" variant="ghost">
              1m
            </Button>
            <Button size="sm" variant="ghost">
              5m
            </Button>
            <Button size="sm" variant="secondary">
              1H
            </Button>
            <Button size="sm" variant="ghost">
              1D
            </Button>
          </>
        }
      >
        <Toolbar>
          <ToolbarGroup>
            <Button size="sm" variant="ghost">
              Cursor
            </Button>
            <Button size="sm" variant="ghost">
              Crosshair
            </Button>
            <Button size="sm" variant="ghost">
              Measure
            </Button>
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <Button size="sm" variant="ghost">
              Line
            </Button>
            <Button size="sm" variant="ghost">
              Ray
            </Button>
            <Button size="sm" variant="ghost">
              Fib
            </Button>
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <Button size="sm" variant="ghost">
              EMA
            </Button>
            <Button size="sm" variant="ghost">
              VWAP
            </Button>
            <Button size="sm" variant="ghost">
              RSI
            </Button>
          </ToolbarGroup>
        </Toolbar>

        <div
          style={{
            marginTop: "var(--space-3)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "var(--space-3)"
          }}
        >
          <Card>
            <CardMeta>Last price</CardMeta>
            <CardTitle>
              <span className="xake-numeric">228.41</span>
            </CardTitle>
            <CardDescription>
              <span className="xake-numeric" style={{ color: "var(--colour-positive)" }}>
                +1.24 (+0.55%)
              </span>
            </CardDescription>
          </Card>
          <Card>
            <CardMeta>Today's range</CardMeta>
            <CardTitle>
              <span className="xake-numeric">226.10 — 229.82</span>
            </CardTitle>
            <CardDescription>Volume 42.1M</CardDescription>
          </Card>
          <Card>
            <CardMeta>P&amp;L (paper)</CardMeta>
            <CardTitle>
              <span className="xake-numeric" style={{ color: "var(--colour-positive)" }}>
                +$124.36
              </span>
            </CardTitle>
            <CardDescription>10 shares @ 215.98 avg</CardDescription>
          </Card>
        </div>
      </Panel>

      <Separator />

      <SectionHeader
        eyebrow="State"
        title="Empty · Error"
        description="Every list, grid, and container has an opinion about being empty and about breaking."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "var(--space-4)" }}>
        <EmptyState
          icon={<span style={{ fontSize: 18 }}>◉</span>}
          title="No watchlists yet"
          description="Build a starter list from AI radar, earnings, crypto momentum, or macro week."
          actions={<Button variant="primary">Create watchlist</Button>}
        />
        <ErrorState
          icon={<span style={{ fontSize: 18 }}>!</span>}
          title="Live stream interrupted"
          description="We're reconnecting. Last tick received at 14:03:12 AEST."
          detail="RECONNECT · attempt 2 of 5"
          actions={<Button variant="secondary">Retry now</Button>}
        />
      </div>

      <Separator />

      <SectionHeader
        eyebrow="Chrome"
        title="Status bar"
        description="Always visible, always honest. Feed health, session, environment, timezone, build."
      />
      <StatusBar>
        <StatusItem label="feed" value="mock · 42ms" tone="positive" />
        <StatusItem label="session" value="US regular" tone="info" />
        <StatusItem label="env" value="paper" tone="warning" />
        <StatusItem label="timezone" value="AEDT (UTC+11)" />
        <StatusItem label="build" value="stage-2" />
      </StatusBar>
    </div>
  );
}

import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardMeta,
  CardTitle,
  EnvBadge,
  Kbd,
  SectionHeader,
  Separator,
  ThemeToggle
} from "@xake/ui";
import {
  BORDER_SWATCHES,
  SEMANTIC_SWATCHES,
  SURFACE_SWATCHES,
  SwatchGrid,
  TEXT_SWATCHES
} from "../_showcase/swatches";

const RADII = [
  { name: "xs", value: "4px", varName: "--radius-xs" },
  { name: "sm", value: "6px", varName: "--radius-sm" },
  { name: "md", value: "8px", varName: "--radius-md" },
  { name: "lg", value: "10px", varName: "--radius-lg" },
  { name: "xl", value: "12px", varName: "--radius-xl" },
  { name: "2xl", value: "14px", varName: "--radius-2xl" },
  { name: "pill", value: "999px", varName: "--radius-pill" }
];

const SHADOWS = [
  { name: "xs", varName: "--shadow-xs" },
  { name: "sm", varName: "--shadow-sm" },
  { name: "md", varName: "--shadow-md" },
  { name: "lg", varName: "--shadow-lg" },
  { name: "xl", varName: "--shadow-xl" },
  { name: "glow-accent", varName: "--shadow-glow-accent" }
];

const SPACING = [
  { name: "1", px: 4 },
  { name: "2", px: 8 },
  { name: "3", px: 12 },
  { name: "4", px: 16 },
  { name: "5", px: 20 },
  { name: "6", px: 24 },
  { name: "8", px: 32 },
  { name: "10", px: 40 },
  { name: "12", px: 48 },
  { name: "16", px: 64 }
];

const TYPE_ROLES = [
  { name: "display", size: 44, weight: 600, note: "Marketing hero only" },
  { name: "h1", size: 30, weight: 600, note: "Page heading" },
  { name: "h2", size: 22, weight: 600, note: "Section heading" },
  { name: "h3", size: 17, weight: 600, note: "Panel heading" },
  { name: "body", size: 15, weight: 400, note: "Default text" },
  { name: "body-strong", size: 15, weight: 500, note: "Emphasised text" },
  { name: "dense", size: 13, weight: 500, note: "Tables, watchlists" },
  { name: "micro", size: 11, weight: 500, note: "Labels (mono, wide)" }
];

const MOTION = [
  { name: "instant", value: "80ms" },
  { name: "fast", value: "140ms" },
  { name: "medium", value: "200ms" },
  { name: "slow", value: "320ms" }
];

export default function StyleGuidePage() {
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
          <Badge tone="accent">Style guide</Badge>
        </div>
        <div style={{ display: "inline-flex", gap: "var(--space-3)", alignItems: "center" }}>
          <EnvBadge env="paper" />
          <ThemeToggle />
        </div>
      </header>

      <SectionHeader
        eyebrow="Stage 2 — design system"
        title="XAKE style guide"
        description="Every token on one page. Use CSS variables for anything that renders; the TypeScript tokens exist only for logic that cannot read the cascade."
      />

      <section>
        <SectionHeader
          eyebrow="Colour"
          title="Surfaces"
          description="Four layered surfaces create depth without glassmorphism. Each theme remaps these cleanly."
        />
        <SwatchGrid swatches={SURFACE_SWATCHES} />
      </section>

      <section>
        <SectionHeader eyebrow="Colour" title="Text" description="Body text clears WCAG AA against bg-primary in every theme." />
        <SwatchGrid swatches={TEXT_SWATCHES} />
      </section>

      <section>
        <SectionHeader eyebrow="Colour" title="Borders" description="Three border weights. Subtle separates related items; strong announces focus or hover." />
        <SwatchGrid swatches={BORDER_SWATCHES} />
      </section>

      <section>
        <SectionHeader
          eyebrow="Colour"
          title="Semantic"
          description="Use sparingly. Accent is for focus and wayfinding — not decoration. Profit and loss are reserved for numeric P&L and should never be used for chrome."
        />
        <SwatchGrid swatches={SEMANTIC_SWATCHES} />

        <div
          style={{
            display: "flex",
            gap: "var(--space-4)",
            marginTop: "var(--space-5)",
            flexWrap: "wrap"
          }}
        >
          <span
            className="xake-numeric"
            style={{ color: "var(--colour-positive)", fontSize: "var(--text-numeric-lg)", fontWeight: 600 }}
          >
            +2.34%
          </span>
          <span
            className="xake-numeric"
            style={{ color: "var(--colour-negative)", fontSize: "var(--text-numeric-lg)", fontWeight: 600 }}
          >
            −1.18%
          </span>
          <span
            className="xake-numeric"
            style={{ color: "var(--colour-text-secondary)", fontSize: "var(--text-numeric-lg)", fontWeight: 600 }}
          >
            0.00%
          </span>
        </div>
      </section>

      <Separator />

      <section>
        <SectionHeader
          eyebrow="Typography"
          title="Type scale"
          description="Geist Sans for interface, Geist Mono for numbers, order IDs, ticker symbols, and machine-adjacent labels."
        />
        <div>
          {TYPE_ROLES.map((r) => (
            <div key={r.name} className="sg-row">
              <div className="sg-row__label">
                <div>{r.name}</div>
                <div style={{ color: "var(--colour-text-muted)", textTransform: "none", marginTop: 4 }}>
                  {r.size}px / {r.weight}
                </div>
              </div>
              <div
                className="sg-row__value"
                style={{ fontSize: r.size, fontWeight: r.weight, lineHeight: 1.2 }}
              >
                The quick brown fox jumps 1,234.56 {r.note ? `· ${r.note}` : ""}
              </div>
            </div>
          ))}
          <div className="sg-row">
            <div className="sg-row__label">numeric (mono, tabular)</div>
            <div
              className="sg-row__value xake-numeric"
              style={{ fontSize: "var(--text-numeric-lg)", fontWeight: 600 }}
            >
              4 321.0987 / +12.34 / -0.056
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Spacing" title="8px base · 4px half-steps" description="Use tokens, never raw pixels." />
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {SPACING.map((s) => (
            <div key={s.name} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <span className="sg-row__label" style={{ width: 64 }}>
                space-{s.name}
              </span>
              <span className="sg-spacing-block" style={{ width: s.px }} aria-hidden />
              <span className="xake-micro-label">{s.px}px</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Shape" title="Radii" description="Restrained rounding — match component mass, never over-round." />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
          {RADII.map((r) => (
            <div key={r.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div
                className="sg-radius-tile"
                style={{ borderRadius: `var(${r.varName})` }}
                aria-hidden
              />
              <span className="xake-micro-label">{r.name}</span>
              <span className="sg-swatch__value">{r.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow="Depth"
          title="Shadows"
          description="Subtle, never soft-blur-heavy. The glow shadow is reserved for critical interactive states."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "var(--space-4)" }}>
          {SHADOWS.map((s) => (
            <div key={s.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div className="sg-shadow-tile" style={{ boxShadow: `var(${s.varName})` }} aria-hidden />
              <span className="xake-micro-label">{s.name}</span>
              <span className="sg-swatch__value">{s.varName}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow="Motion"
          title="Duration and easing"
          description="All tokens respect prefers-reduced-motion. Nothing animates for flair."
        />
        <div>
          {MOTION.map((m) => (
            <div key={m.name} className="sg-row">
              <div className="sg-row__label">{m.name}</div>
              <div className="sg-row__value">{m.value}</div>
            </div>
          ))}
          <div className="sg-row">
            <div className="sg-row__label">ease-standard</div>
            <div className="sg-row__value">cubic-bezier(0.2, 0, 0, 1)</div>
          </div>
          <div className="sg-row">
            <div className="sg-row__label">ease-out-expo</div>
            <div className="sg-row__value">cubic-bezier(0.16, 1, 0.3, 1)</div>
          </div>
          <div className="sg-row">
            <div className="sg-row__label">ease-in-out</div>
            <div className="sg-row__value">cubic-bezier(0.65, 0, 0.35, 1)</div>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="State" title="Focus, hover, disabled" description="Focus rings appear on keyboard, not mouse. Every actionable element honours them." />
        <div className="showcase-row">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Environments" title="Paper and live badges" description="The trading environment is never in doubt." />
        <div className="showcase-row">
          <EnvBadge env="paper" />
          <EnvBadge env="live" />
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Keyboard" title="Shortcut pills" description="Mono pill with a subtle deeper bottom edge to imply depth." />
        <div className="showcase-row">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
          <span style={{ color: "var(--colour-text-muted)" }}>opens command palette</span>
          <Kbd>G</Kbd>
          <Kbd>C</Kbd>
          <span style={{ color: "var(--colour-text-muted)" }}>go to charts</span>
        </div>
      </section>

      <Card>
        <CardMeta>Usage rules</CardMeta>
        <CardTitle>Five hard rules</CardTitle>
        <CardDescription>
          One dominant decision per viewport. Chart context beats chrome. Every risky action
          declares its consequences before submit. Dense is not noisy. Motion signals state —
          never flair.
        </CardDescription>
      </Card>
    </div>
  );
}

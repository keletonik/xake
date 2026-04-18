import type { CSSProperties } from "react";

interface Swatch {
  name: string;
  varName: string;
  hint?: string;
}

export const SURFACE_SWATCHES: Swatch[] = [
  { name: "bg-primary", varName: "--colour-bg-primary", hint: "Page surface" },
  { name: "bg-canvas", varName: "--colour-bg-canvas", hint: "App canvas" },
  { name: "bg-raised", varName: "--colour-bg-raised", hint: "Panel / card" },
  { name: "bg-elevated", varName: "--colour-bg-elevated", hint: "Popover / dialog" }
];

export const TEXT_SWATCHES: Swatch[] = [
  { name: "text-primary", varName: "--colour-text-primary", hint: "Body / headings" },
  { name: "text-secondary", varName: "--colour-text-secondary", hint: "Descriptive" },
  { name: "text-muted", varName: "--colour-text-muted", hint: "Micro labels" },
  { name: "text-disabled", varName: "--colour-text-disabled", hint: "Disabled" }
];

export const BORDER_SWATCHES: Swatch[] = [
  { name: "border-subtle", varName: "--colour-border-subtle" },
  { name: "border", varName: "--colour-border" },
  { name: "border-strong", varName: "--colour-border-strong" }
];

export const SEMANTIC_SWATCHES: Swatch[] = [
  { name: "accent", varName: "--colour-accent", hint: "Interactive focus" },
  { name: "positive", varName: "--colour-positive", hint: "Profit / up" },
  { name: "negative", varName: "--colour-negative", hint: "Loss / down" },
  { name: "warning", varName: "--colour-warning", hint: "Caution / paper" },
  { name: "info", varName: "--colour-info", hint: "Informational" }
];

export function SwatchGrid({ swatches }: { swatches: Swatch[] }) {
  return (
    <div className="sg-palette">
      {swatches.map((s) => (
        <div key={s.name} className="sg-swatch">
          <div
            className="sg-swatch__chip"
            style={{ background: `var(${s.varName})` } as CSSProperties}
            aria-hidden
          />
          <div className="sg-swatch__meta">
            <span className="sg-swatch__name">{s.name}</span>
            <span className="sg-swatch__value">{s.varName}</span>
            {s.hint ? (
              <span className="sg-swatch__value" style={{ marginTop: 4, textTransform: "none" }}>
                {s.hint}
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

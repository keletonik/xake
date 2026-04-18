# XAKE tokens

This is the canonical reference for every design token. The live source of truth is `packages/ui/src/tokens.css`. TypeScript mirrors live in `packages/ui/src/tokens.ts` for logic that cannot read the CSS cascade (chart colours, semantic decisions in code).

Philosophy: we use CSS custom properties, not utility classes. Utilities trap you into rewriting the system every time the direction shifts. Variables let us retheme the whole product by changing one file.

## Rules of use

- Always reference tokens via `var(--…)`. Never hard-code colours or spacing.
- Three themes are supported: `dark` (default), `darker` (low-light sessions), `light` (system tracking).
- Theme is set on `<html data-theme="…">`. The bootstrap script in `layout.tsx` applies the correct value before first paint to avoid flashes.
- Body text must clear **WCAG AA (4.5:1)** against `--colour-bg-primary` in every theme. Large text clears 3:1.
- Respect `prefers-reduced-motion`. The global media query in `tokens.css` already collapses durations, but component-level motion must not introduce its own bespoke animation loops.

## Colour — surfaces

| Token | Role |
|---|---|
| `--colour-bg-primary` | Page background. The quietest surface. |
| `--colour-bg-canvas` | App canvas. Slightly raised from page. |
| `--colour-bg-raised` | Panels, cards, rail. |
| `--colour-bg-elevated` | Popovers, dialogs, toasts. Highest surface. |
| `--colour-bg-overlay` | Dialog/scrim overlay. |

Hierarchy goes *primary → canvas → raised → elevated*. Never skip layers.

## Colour — text

| Token | Role |
|---|---|
| `--colour-text-primary` | Body and headings. |
| `--colour-text-secondary` | Descriptive copy, lede. |
| `--colour-text-muted` | Micro labels, meta, breadcrumbs. |
| `--colour-text-disabled` | Inactive controls only. Never for low-importance live text. |
| `--colour-text-on-accent` | Text rendered on the accent colour. |

## Colour — borders

| Token | Role |
|---|---|
| `--colour-border-subtle` | Hairlines inside dense areas (rows, list items). |
| `--colour-border` | Default surface border. |
| `--colour-border-strong` | Hover state, strong separation. |

## Colour — semantic

| Token | Role |
|---|---|
| `--colour-accent` | The single interactive-focus colour. Use sparingly. Never decorative. |
| `--colour-positive` | Profit, up, success. Reserved for numeric P&L and positive fills. |
| `--colour-negative` | Loss, down, destructive. Reserved for numeric P&L and destructive actions. |
| `--colour-warning` | Caution, paper environment, delayed feed. |
| `--colour-info` | Informational surfaces, news affordances. |

Every semantic colour has a `*-subtle` and `*-border` variant for background fills and borders.

## Radii

| Token | Value | Use |
|---|---|---|
| `--radius-xs` | 4px | Focus ring rounding |
| `--radius-sm` | 6px | Chips, pills inside dense surfaces |
| `--radius-md` | 8px | Buttons, inputs, small cards |
| `--radius-lg` | 10px | Panels, primary cards |
| `--radius-xl` | 12px | Dialogs, modals |
| `--radius-2xl` | 14px | Hero or marketing panels |
| `--radius-pill` | 999px | Badges, theme toggle |

Match rounding to component mass. A 36px-tall button with 14px radius looks childish. A 56px hero card with 6px radius looks hostile.

## Shadows

| Token | Use |
|---|---|
| `--shadow-xs` | Subtle rise (segmented controls). |
| `--shadow-sm` | Buttons in certain states. |
| `--shadow-md` | Toasts, popovers. |
| `--shadow-lg` | Floating panels. |
| `--shadow-xl` | Dialogs. |
| `--shadow-glow-accent` | Critical interactive state only (e.g. primary action focus). |
| `--focus-ring` | The global focus ring. Applied via `:focus-visible`. |
| `--focus-ring-danger` | Focus ring for destructive actions. |

Shadows are never a substitute for contrast. On light theme they use soft grey; on dark themes they deepen into near-black.

## Spacing

Base unit is **8px** with **4px half-steps** where density demands it.

`space-0` `space-1` `space-2` `space-3` `space-4` `space-5` `space-6` `space-8` `space-10` `space-12` `space-16` `space-20` `space-24` `space-32`

## Typography

| Token | Size | Weight | Use |
|---|---|---|---|
| `--text-display` | 44px | 600 | Marketing hero only |
| `--text-h1` | 30px | 600 | Page heading |
| `--text-h2` | 22px | 600 | Section heading |
| `--text-h3` | 17px | 600 | Panel heading |
| `--text-body` | 15px | 400/500 | Default text |
| `--text-dense` | 13px | 500 | Tables, watchlists |
| `--text-micro` | 11px | 500 | Labels (mono, wide tracking) |
| `--text-numeric-lg` | 24px | 600 | Large P&L, price callouts |
| `--text-numeric-md` | 18px | 600 | Table numeric emphasis |

Fonts: **Geist Sans** for interface, **Geist Mono** for numbers, tickers, order IDs, keyboard hints, and labels. The body sets `font-variant-numeric: tabular-nums` globally so digits align in dense tables.

## Motion

| Token | Value | Use |
|---|---|---|
| `--duration-instant` | 80ms | Hover colour shifts |
| `--duration-fast` | 140ms | Button, input transitions |
| `--duration-medium` | 200ms | Drawer and dialog fades |
| `--duration-slow` | 320ms | Multi-step choreography |

| Easing | Use |
|---|---|
| `--ease-standard` | Default UI transitions |
| `--ease-out-expo` | Overlay entrances |
| `--ease-in-out` | Choreographed transitions |

## Z-index

`--z-rail` `--z-topbar` `--z-dropdown` `--z-dialog` `--z-popover` `--z-tooltip` `--z-toast`

Use tokens — never arbitrary values. Layering is decided once, centrally.

## Themes

Three themes. Theme is a document-level attribute, not a per-component prop.

- **dark** — default. Quiet, premium, readable in daylight.
- **darker** — for low-light trading. Further reduces base luminance; semantic colours dim to match.
- **light** — accessible, high-contrast, tracks `prefers-color-scheme` when the user picks `system`.

To switch themes in code: `const { setTheme } = useTheme(); setTheme("darker")`.

## Accessibility

- Every interactive element must expose a visible `:focus-visible` state via `--focus-ring`.
- Colour alone never carries meaning. Every semantic colour is paired with text, an icon, or position.
- Motion honours `prefers-reduced-motion: reduce` at the root. Component authors must not add animations that bypass the root rule.
- Contrast of primary text against primary background: dark theme ≈ 17:1, darker theme ≈ 16:1, light theme ≈ 18:1. Secondary text passes AA body minimums; muted text is reserved for labels (≥3:1) and never for body copy.

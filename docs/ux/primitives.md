# XAKE primitives

Every component exported from `@xake/ui`. Each entry lists what the component is for, what it is *not* for, and what to avoid.

## Button

Variants: `primary`, `secondary`, `ghost`, `danger`, `link`. Sizes: `sm`, `md`, `lg`. Supports `iconOnly`, `leadingIcon`, `trailingIcon`.

- **Primary** is the singular, decisive action on a surface. Never more than one per viewport.
- **Secondary** is the neutral default.
- **Ghost** lives inside toolbars, cards, and rows.
- **Danger** is for destructive or reversible-with-effort actions.
- **Link** is an in-flow text action, not a page link.

Avoid stacking two primaries. If you feel you need both, one of them is not actually primary.

## Input · Textarea

Standard height 36px. Mono variant (`variant="mono"`) for ticker entry, order IDs, and command-like inputs. Focus state uses `--focus-ring` plus `--colour-accent-border`.

## Badge · EnvBadge · Kbd

- **Badge** for compact state labels (live, delayed, halted). Tones: accent, positive, negative, warning, info.
- **EnvBadge** is the non-negotiable trading-environment indicator. It must appear on every surface where the user could take a trading action.
- **Kbd** is the keyboard shortcut pill. Always paired with human prose — never floating alone.

## Separator

Horizontal or vertical. Thin 1px using `--colour-border`. Do not stack multiple separators.

## Card

Surface for grouped content. Use `interactive` when the whole card is clickable. Composes with `CardTitle`, `CardDescription`, `CardMeta`.

## Panel

The workstation's signature surface. A bordered `bg-canvas` block with a headered `bg-raised` strip and a scrollable body. Use `dense` for tight layouts, `flush` when the body manages its own padding (e.g. the chart canvas).

## Toolbar · ToolbarGroup · ToolbarSeparator

Used inside panels to group tool controls. `ToolbarGroup` clusters related buttons; `ToolbarSeparator` divides groups.

## SectionHeader

Eyebrow + title + description + actions. The right way to open every marketing section and every page-level view.

## StatusBar · StatusItem

Fixed footer describing feed health, session state, environment, timezone, and build. Never hide it. Toning options: `positive`, `negative`, `warning`, `info`, or default.

## AppShell · AppBrand · TopbarGroup · RailItem · RailHeading

The composed workspace chrome. `AppShell` expects four slots: `topbar`, `rail`, `main`, `statusbar`. The grid collapses on narrow viewports — the rail hides and the topbar stays.

## EmptyState

Every empty list has something to say. Provide a title, a description, and one concrete action.

## ErrorState

For module-level failures (feed drop, portfolio sync failure). Combine a plain-language title with a machine-readable detail line (error code, retry attempt). Pair with at least one action.

## Tabs (Radix)

`Tabs` · `TabsList` · `TabsTrigger` · `TabsContent`. Keyboard-navigable by default (arrow keys, Home, End). Use sparingly — tabs hide content.

## Tooltip (Radix)

`TooltipProvider` · `Tooltip` · `TooltipTrigger` · `TooltipContent` · `QuickTooltip`. Use for *clarification*, never for primary content. 150ms delay by default to avoid hover noise.

## Dialog (Radix)

`Dialog` · `DialogTrigger` · `DialogContent` · `DialogTitle` · `DialogDescription` · `DialogFooter` · `DialogClose`. Focus-trapped, escape-dismissible, scrim uses `--colour-bg-overlay`. Never use for non-modal UI.

## Toast

`ToastProvider` mounts once near the root. Inside components, `useToast().push({ tone, title, description })`. Default duration 5s. Tones mirror the semantic palette.

## ThemeProvider · ThemeToggle · useTheme

`ThemeProvider` wraps the app. `ThemeToggle` renders a segmented control with four options: Dark, Darker, Light, System. `useTheme()` returns `{ theme, resolved, setTheme }`. The bootstrap script in `layout.tsx` sets the theme before first paint so there is no flash.

## Accessibility commitments

- Every actionable primitive has a visible `:focus-visible` state.
- Radix primitives handle focus trapping, ARIA wiring, and keyboard interactions.
- The AppShell collapses responsively rather than hiding chrome on mobile.
- Reduced-motion is honoured via the root media query — component authors should not bypass it with their own animations.

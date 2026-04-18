# @xake/ui

The XAKE design system: tokens, theme engine, and accessible primitives.

## Import

```tsx
// In your root layout (Next.js):
import "@xake/ui/styles.css";
import { ThemeProvider, TooltipProvider, ToastProvider } from "@xake/ui";

// Then use any primitive:
import { Button, Panel, EnvBadge, useToast } from "@xake/ui";
```

The single `@xake/ui/styles.css` import brings in tokens, base element styles, and all component CSS.

## Themes

Three themes — `dark` (default), `darker`, `light` — plus a `system` option that tracks `prefers-color-scheme`. Theme selection is persisted in `localStorage` under the key `xake-theme` and applied to `<html data-theme="…">` before first paint via the `THEME_BOOTSTRAP_SCRIPT`.

## What ships

- Design tokens: colour, typography, spacing, radii, shadows, motion, focus, z-index
- Theme provider and segmented theme toggle
- Primitives: `Button`, `Input`, `Textarea`, `Badge`, `EnvBadge`, `Kbd`, `Separator`, `Card`, `Panel`, `Toolbar`, `SectionHeader`, `StatusBar`, `EmptyState`, `ErrorState`, `AppShell`
- Radix-backed: `Tabs`, `Tooltip`, `Dialog`, `Toast`

## Docs

- Token reference: [`docs/ux/tokens.md`](../../docs/ux/tokens.md)
- Primitive reference: [`docs/ux/primitives.md`](../../docs/ux/primitives.md)
- Live style guide: `/style-guide` in the web app
- Live components showcase: `/components` in the web app

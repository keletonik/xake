/**
 * XAKE design tokens — canonical TypeScript definitions.
 *
 * These values mirror the CSS custom properties declared in tokens.css.
 * Use CSS variables for anything that renders; import from here only when
 * tokens need to be referenced in JS/TS logic (chart colouring, motion
 * calculations, contrast-aware selections).
 */

export const COLOURS = {
  dark: {
    bgPrimary: "#0A0D12",
    bgCanvas: "#0F131A",
    bgRaised: "#151A22",
    bgElevated: "#1A2030",
    bgOverlay: "rgba(10, 13, 18, 0.72)",
    borderSubtle: "rgba(255, 255, 255, 0.06)",
    border: "rgba(255, 255, 255, 0.09)",
    borderStrong: "rgba(255, 255, 255, 0.14)",
    textPrimary: "#F5F7FA",
    textSecondary: "#A8B0BF",
    textMuted: "#7D8696",
    textDisabled: "#4C5462",
    accent: "#6EE7F9",
    accentHover: "#8DECFA",
    accentSubtle: "rgba(110, 231, 249, 0.08)",
    positive: "#18C37E",
    positiveSubtle: "rgba(24, 195, 126, 0.10)",
    negative: "#FF5B6E",
    negativeSubtle: "rgba(255, 91, 110, 0.10)",
    warning: "#F5B94C",
    warningSubtle: "rgba(245, 185, 76, 0.10)",
    info: "#5FA8FF",
    infoSubtle: "rgba(95, 168, 255, 0.10)"
  },
  darker: {
    bgPrimary: "#05070B",
    bgCanvas: "#090B10",
    bgRaised: "#0F131A",
    bgElevated: "#151A22",
    bgOverlay: "rgba(5, 7, 11, 0.78)",
    borderSubtle: "rgba(255, 255, 255, 0.05)",
    border: "rgba(255, 255, 255, 0.08)",
    borderStrong: "rgba(255, 255, 255, 0.12)",
    textPrimary: "#ECEFF5",
    textSecondary: "#9198A7",
    textMuted: "#6B7382",
    textDisabled: "#3E4652",
    accent: "#60DCEF",
    accentHover: "#7EE3F3",
    accentSubtle: "rgba(96, 220, 239, 0.08)",
    positive: "#12B372",
    positiveSubtle: "rgba(18, 179, 114, 0.10)",
    negative: "#E84B5C",
    negativeSubtle: "rgba(232, 75, 92, 0.10)",
    warning: "#E8AE46",
    warningSubtle: "rgba(232, 174, 70, 0.10)",
    info: "#4E97EF",
    infoSubtle: "rgba(78, 151, 239, 0.10)"
  },
  light: {
    bgPrimary: "#F7F8FA",
    bgCanvas: "#FFFFFF",
    bgRaised: "#FFFFFF",
    bgElevated: "#FFFFFF",
    bgOverlay: "rgba(15, 19, 26, 0.48)",
    borderSubtle: "rgba(15, 19, 26, 0.06)",
    border: "rgba(15, 19, 26, 0.10)",
    borderStrong: "rgba(15, 19, 26, 0.18)",
    textPrimary: "#0A0D12",
    textSecondary: "#3A414D",
    textMuted: "#6B7280",
    textDisabled: "#B4B9C2",
    accent: "#0891B2",
    accentHover: "#0E7490",
    accentSubtle: "rgba(8, 145, 178, 0.08)",
    positive: "#0D9668",
    positiveSubtle: "rgba(13, 150, 104, 0.10)",
    negative: "#DC2633",
    negativeSubtle: "rgba(220, 38, 51, 0.10)",
    warning: "#B15C00",
    warningSubtle: "rgba(177, 92, 0, 0.10)",
    info: "#2563EB",
    infoSubtle: "rgba(37, 99, 235, 0.10)"
  }
} as const;

export const SPACING = {
  "0": "0",
  "1": "4px",
  "2": "8px",
  "3": "12px",
  "4": "16px",
  "5": "20px",
  "6": "24px",
  "8": "32px",
  "10": "40px",
  "12": "48px",
  "16": "64px",
  "20": "80px",
  "24": "96px",
  "32": "128px"
} as const;

export const RADIUS = {
  xs: "4px",
  sm: "6px",
  md: "8px",
  lg: "10px",
  xl: "12px",
  "2xl": "14px",
  pill: "999px"
} as const;

export const SHADOW = {
  xs: "0 1px 2px rgba(0, 0, 0, 0.25)",
  sm: "0 2px 6px rgba(0, 0, 0, 0.30)",
  md: "0 4px 16px rgba(0, 0, 0, 0.35)",
  lg: "0 8px 32px rgba(0, 0, 0, 0.40)",
  xl: "0 16px 48px rgba(0, 0, 0, 0.50)",
  focusAccent: "0 0 0 2px rgba(110, 231, 249, 0.45)",
  focusDanger: "0 0 0 2px rgba(255, 91, 110, 0.45)",
  glowAccent: "0 0 0 1px rgba(110, 231, 249, 0.20), 0 0 24px rgba(110, 231, 249, 0.15)"
} as const;

export const TYPE_SCALE = {
  display: { size: "44px", lineHeight: "1.06", weight: 600, tracking: "-0.02em" },
  h1: { size: "30px", lineHeight: "1.12", weight: 600, tracking: "-0.015em" },
  h2: { size: "22px", lineHeight: "1.24", weight: 600, tracking: "-0.01em" },
  h3: { size: "17px", lineHeight: "1.35", weight: 600, tracking: "-0.005em" },
  body: { size: "15px", lineHeight: "1.55", weight: 400, tracking: "0" },
  bodyStrong: { size: "15px", lineHeight: "1.55", weight: 500, tracking: "0" },
  dense: { size: "13px", lineHeight: "1.45", weight: 500, tracking: "0" },
  micro: { size: "11px", lineHeight: "1.4", weight: 500, tracking: "0.12em" },
  numericLg: { size: "24px", lineHeight: "1.1", weight: 600, tracking: "-0.01em" },
  numericMd: { size: "18px", lineHeight: "1.2", weight: 600, tracking: "0" }
} as const;

export const MOTION = {
  duration: {
    instant: "80ms",
    fast: "140ms",
    medium: "200ms",
    slow: "320ms"
  },
  easing: {
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    outExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
    inOut: "cubic-bezier(0.65, 0, 0.35, 1)"
  }
} as const;

export const Z_INDEX = {
  base: 0,
  rail: 10,
  topbar: 20,
  dropdown: 40,
  dialog: 60,
  popover: 70,
  tooltip: 80,
  toast: 90
} as const;

export type ThemeName = "dark" | "darker" | "light" | "system";
export type ResolvedTheme = "dark" | "darker" | "light";

export const SEMANTIC = {
  profit: "var(--colour-positive)",
  loss: "var(--colour-negative)",
  neutral: "var(--colour-text-secondary)",
  warn: "var(--colour-warning)",
  info: "var(--colour-info)"
} as const;

"use client";

import { useTheme } from "./theme-provider";
import type { ThemeName } from "../tokens";

const OPTIONS: ReadonlyArray<{ value: ThemeName; label: string; hint: string }> = [
  { value: "dark", label: "Dark", hint: "D" },
  { value: "darker", label: "Darker", hint: "K" },
  { value: "light", label: "Light", hint: "L" },
  { value: "system", label: "System", hint: "S" }
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="xake-theme-toggle"
    >
      {OPTIONS.map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            data-active={active || undefined}
            onClick={() => setTheme(opt.value)}
            className="xake-theme-toggle__option"
            type="button"
          >
            <span className="xake-theme-toggle__label">{opt.label}</span>
            <span className="xake-theme-toggle__hint" aria-hidden>
              {opt.hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}

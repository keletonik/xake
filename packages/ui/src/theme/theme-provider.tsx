"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { ResolvedTheme, ThemeName } from "../tokens";

const STORAGE_KEY = "xake-theme";
const THEMES: ReadonlyArray<ThemeName> = ["dark", "darker", "light", "system"];

interface ThemeContextValue {
  readonly theme: ThemeName;
  readonly resolved: ResolvedTheme;
  readonly setTheme: (next: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const readStoredTheme = (fallback: ThemeName): ThemeName => {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return (THEMES as readonly string[]).includes(raw ?? "") ? (raw as ThemeName) : fallback;
};

const getSystemPreference = (): ResolvedTheme => {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const resolveTheme = (theme: ThemeName): ResolvedTheme =>
  theme === "system" ? getSystemPreference() : theme;

const applyTheme = (resolved: ResolvedTheme) => {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", resolved);
};

export function ThemeProvider({
  children,
  defaultTheme = "dark"
}: {
  children: ReactNode;
  defaultTheme?: ThemeName;
}) {
  const [theme, setThemeState] = useState<ThemeName>(defaultTheme);
  const [resolved, setResolved] = useState<ResolvedTheme>(
    defaultTheme === "system" ? "dark" : (defaultTheme as ResolvedTheme)
  );

  useEffect(() => {
    const stored = readStoredTheme(defaultTheme);
    setThemeState(stored);
    const next = resolveTheme(stored);
    setResolved(next);
    applyTheme(next);
  }, [defaultTheme]);

  useEffect(() => {
    if (theme !== "system" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const next = getSystemPreference();
      setResolved(next);
      applyTheme(next);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next);
    const nextResolved = resolveTheme(next);
    setResolved(nextResolved);
    applyTheme(nextResolved);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const value = useMemo(() => ({ theme, resolved, setTheme }), [theme, resolved, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

export const THEME_BOOTSTRAP_SCRIPT = `(() => {
  try {
    var s = localStorage.getItem('${STORAGE_KEY}');
    var theme = (s === 'dark' || s === 'darker' || s === 'light' || s === 'system') ? s : 'dark';
    var resolved = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    document.documentElement.setAttribute('data-theme', resolved);
  } catch (_) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();`;

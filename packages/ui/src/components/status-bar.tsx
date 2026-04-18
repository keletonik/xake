import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface StatusBarProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export function StatusBar({ className, children, ...rest }: StatusBarProps) {
  return (
    <footer className={cn("xake-statusbar", className)} {...rest}>
      {children}
    </footer>
  );
}

export function StatusItem({
  label,
  value,
  tone
}: {
  label: string;
  value: ReactNode;
  tone?: "neutral" | "positive" | "negative" | "warning" | "info";
}) {
  const colour =
    tone === "positive"
      ? "var(--colour-positive)"
      : tone === "negative"
        ? "var(--colour-negative)"
        : tone === "warning"
          ? "var(--colour-warning)"
          : tone === "info"
            ? "var(--colour-info)"
            : "var(--colour-text-secondary)";
  return (
    <span className="xake-statusbar__item">
      <span>{label}</span>
      <strong style={{ color: colour }}>{value}</strong>
    </span>
  );
}

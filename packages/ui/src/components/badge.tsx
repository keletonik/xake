import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export type BadgeTone = "neutral" | "accent" | "positive" | "negative" | "warning" | "info";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
  children: ReactNode;
}

export function Badge({ tone = "neutral", dot, className, children, ...rest }: BadgeProps) {
  return (
    <span
      data-tone={tone === "neutral" ? undefined : tone}
      className={cn("xake-badge", className)}
      {...rest}
    >
      {dot ? <span className="xake-badge__dot" aria-hidden /> : null}
      {children}
    </span>
  );
}

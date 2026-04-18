import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export interface EnvBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  env?: "paper" | "live";
}

export function EnvBadge({ env = "paper", className, ...rest }: EnvBadgeProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      data-env={env}
      className={cn("xake-env-badge", className)}
      {...rest}
    >
      <span className="xake-env-badge__dot" aria-hidden />
      {env === "paper" ? "Paper environment" : "Live environment"}
    </span>
  );
}

import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

/**
 * Persistent, unmissable banner that confirms the user is operating in
 * the paper environment. Renders as a slim top strip above the shell.
 * Do not hide on scroll. Do not soften. This is load-bearing signage.
 */

export interface PaperBannerProps extends HTMLAttributes<HTMLDivElement> {
  env?: "paper" | "live";
}

export function PaperBanner({ env = "paper", className, ...rest }: PaperBannerProps) {
  const isPaper = env === "paper";
  return (
    <div
      role="status"
      aria-live="polite"
      data-env={env}
      className={cn("xake-paper-banner", className)}
      {...rest}
    >
      <span className="xake-paper-banner__dot" aria-hidden />
      <strong>
        {isPaper ? "Paper environment" : "Live environment"}
      </strong>
      <span className="xake-paper-banner__note">
        {isPaper
          ? "No real money. Every order is simulated. Positions, P&L, and activity are demo only."
          : "Live account. Orders affect real money."}
      </span>
    </div>
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-10 text-center text-mute-50",
        className,
      )}
    >
      {icon && <div className="text-fg/40">{icon}</div>}
      <div className="font-mono text-[11px] uppercase tracking-caps text-fg">{title}</div>
      {description && <div className="max-w-sm text-[11px] text-mute-50">{description}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

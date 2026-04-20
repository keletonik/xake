import * as React from "react";
import { cn } from "@/lib/utils";

interface PanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
  contentClassName?: string;
}

export function Panel({
  title,
  eyebrow,
  actions,
  children,
  className,
  contentClassName,
  ...props
}: PanelProps) {
  return (
    <section
      className={cn("flex min-h-0 flex-col border border-mute-10 bg-bg", className)}
      {...props}
    >
      {(title || actions || eyebrow) && (
        <header className="flex items-center justify-between gap-4 px-4 h-10 hairline">
          <div className="flex items-center gap-3">
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            {title && (
              <span className="font-mono text-[11px] uppercase tracking-caps text-fg">{title}</span>
            )}
          </div>
          {actions && <div className="flex items-center gap-1">{actions}</div>}
        </header>
      )}
      <div className={cn("flex-1 min-h-0 overflow-auto scrollbar-thin", contentClassName)}>
        {children}
      </div>
    </section>
  );
}

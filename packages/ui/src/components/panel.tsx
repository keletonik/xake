import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface PanelProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  actions?: ReactNode;
  dense?: boolean;
  flush?: boolean;
  children: ReactNode;
}

export function Panel({
  title,
  actions,
  dense,
  flush,
  className,
  children,
  ...rest
}: PanelProps) {
  return (
    <section
      data-dense={dense ? "true" : undefined}
      data-flush={flush ? "true" : undefined}
      className={cn("xake-panel", className)}
      {...rest}
    >
      {(title || actions) && (
        <header className="xake-panel__header">
          <div className="xake-panel__title">{title}</div>
          {actions ? <div className="xake-panel__actions">{actions}</div> : null}
        </header>
      )}
      <div className="xake-panel__body">{children}</div>
    </section>
  );
}

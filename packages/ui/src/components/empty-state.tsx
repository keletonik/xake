import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  actions,
  className,
  ...rest
}: EmptyStateProps) {
  return (
    <div className={cn("xake-empty", className)} {...rest}>
      {icon ? <div className="xake-empty__icon">{icon}</div> : null}
      <h3 className="xake-empty__title">{title}</h3>
      {description ? <p className="xake-empty__description">{description}</p> : null}
      {actions ? <div className="xake-empty__actions">{actions}</div> : null}
    </div>
  );
}

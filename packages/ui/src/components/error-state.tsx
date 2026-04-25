import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface ErrorStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  detail?: ReactNode;
  actions?: ReactNode;
}

export function ErrorState({
  icon,
  title,
  description,
  detail,
  actions,
  className,
  ...rest
}: ErrorStateProps) {
  return (
    <div role="alert" className={cn("xake-error", className)} {...rest}>
      {icon ? <div className="xake-error__icon">{icon}</div> : null}
      <h3 className="xake-error__title">{title}</h3>
      {description ? <p className="xake-error__description">{description}</p> : null}
      {detail ? <code className="xake-error__detail">{detail}</code> : null}
      {actions ? <div className="xake-empty__actions">{actions}</div> : null}
    </div>
  );
}

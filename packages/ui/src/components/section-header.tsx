import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface SectionHeaderProps extends HTMLAttributes<HTMLElement> {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  ...rest
}: SectionHeaderProps) {
  return (
    <header className={cn("xake-section-header", className)} {...rest}>
      <div>
        {eyebrow ? <p className="xake-section-header__eyebrow">{eyebrow}</p> : null}
        <h2 className="xake-section-header__title">{title}</h2>
        {description ? <p className="xake-section-header__description">{description}</p> : null}
      </div>
      {actions ? <div className="xake-section-header__actions">{actions}</div> : null}
    </header>
  );
}

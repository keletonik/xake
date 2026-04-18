import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Card({ interactive, className, children, ...rest }: CardProps) {
  return (
    <div
      data-interactive={interactive ? "true" : undefined}
      className={cn("xake-card", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn("xake-card__title", className)}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("xake-card__description", className)}>{children}</p>;
}

export function CardMeta({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("xake-card__meta", className)}>{children}</span>;
}

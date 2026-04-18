import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  topbar: ReactNode;
  rail: ReactNode;
  main: ReactNode;
  statusbar: ReactNode;
}

export function AppShell({ topbar, rail, main, statusbar, className, ...rest }: AppShellProps) {
  return (
    <div className={cn("xake-shell", className)} {...rest}>
      <header className="xake-shell__topbar">{topbar}</header>
      <aside className="xake-shell__rail" aria-label="Primary">
        {rail}
      </aside>
      <main className="xake-shell__main">{main}</main>
      <div className="xake-shell__statusbar">{statusbar}</div>
    </div>
  );
}

export function AppBrand({ children }: { children?: ReactNode }) {
  return (
    <div className="xake-shell__brand">
      <span className="xake-shell__brand-mark" aria-hidden>
        ◪
      </span>
      <span>{children ?? "XAKE"}</span>
    </div>
  );
}

export function TopbarGroup({ children }: { children: ReactNode }) {
  return <div className="xake-shell__topbar-group">{children}</div>;
}

export interface RailItemProps {
  label: string;
  icon?: ReactNode;
  href?: string;
  active?: boolean;
  hint?: string;
  onSelect?: () => void;
}

export function RailItem({ label, icon, href, active, hint, onSelect }: RailItemProps) {
  const Tag = (href ? "a" : "button") as "a" | "button";
  const commonProps = {
    className: "xake-rail-item",
    "data-active": active ? "true" : undefined
  } as const;
  const content = (
    <>
      {icon ? (
        <span className="xake-rail-item__icon" aria-hidden>
          {icon}
        </span>
      ) : null}
      <span>{label}</span>
      {hint ? <kbd className="xake-kbd xake-rail-item__kbd">{hint}</kbd> : null}
    </>
  );
  if (Tag === "a") {
    return (
      <a href={href} {...commonProps}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" onClick={onSelect} {...commonProps}>
      {content}
    </button>
  );
}

export function RailHeading({ children }: { children: ReactNode }) {
  return <div className="xake-rail-heading">{children}</div>;
}

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Toolbar({ className, children, ...rest }: ToolbarProps) {
  return (
    <div role="toolbar" className={cn("xake-toolbar", className)} {...rest}>
      {children}
    </div>
  );
}

export function ToolbarGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("xake-toolbar__group", className)}>{children}</div>;
}

export function ToolbarSeparator({ className }: { className?: string }) {
  return <span aria-hidden className={cn("xake-toolbar__separator", className)} />;
}

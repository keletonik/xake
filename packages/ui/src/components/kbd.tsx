import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export function Kbd({ className, children, ...rest }: KbdProps) {
  return (
    <kbd className={cn("xake-kbd", className)} {...rest}>
      {children}
    </kbd>
  );
}

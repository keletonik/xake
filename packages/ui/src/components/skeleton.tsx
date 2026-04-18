import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  rounded?: "sm" | "md" | "lg" | "pill";
}

export function Skeleton({ width, height, rounded = "md", className, style, ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn("xake-skeleton", className)}
      data-rounded={rounded}
      style={{ width, height, ...style }}
      {...rest}
    />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={12} width={i === lines - 1 ? "60%" : "100%"} />
      ))}
    </div>
  );
}

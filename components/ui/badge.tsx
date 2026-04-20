import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center border px-2 py-0.5 font-mono uppercase tracking-caps",
  {
    variants: {
      variant: {
        accent: "border-accent text-accent bg-accent/10",
        outline: "border-mute-20 text-fg/70",
        solid: "border-accent bg-accent text-accent-ink",
        up: "border-accent text-accent",
        down: "border-mute-30 text-down",
        mute: "border-mute-10 text-fg/50",
      },
      size: {
        xs: "text-[9px] h-4 px-1.5",
        sm: "text-[10px] h-5",
        md: "text-[11px] h-6 px-2.5",
      },
    },
    defaultVariants: { variant: "outline", size: "sm" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono uppercase tracking-caps transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        accent: "bg-accent text-accent-ink hover:bg-accent/90",
        outline: "border border-mute-20 text-fg hover:border-accent hover:text-accent",
        ghost: "text-fg/70 hover:text-fg hover:bg-mute-6",
        danger: "border border-accent text-accent hover:bg-accent hover:text-accent-ink",
        plain: "text-fg underline-offset-2 hover:underline",
      },
      size: {
        sm: "h-7 px-3 text-[10px]",
        md: "h-9 px-4 text-[11px]",
        lg: "h-11 px-5 text-[12px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "accent", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };

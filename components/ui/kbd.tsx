import * as React from "react";
import { cn } from "@/lib/utils";

export function Kbd({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-[20px] items-center justify-center border border-mute-20 px-1.5 font-mono text-[10px] text-mute-70",
        className,
      )}
      {...props}
    />
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "neon-glow-accent flex h-11 w-full rounded-control border border-border bg-input px-4 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-accent focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

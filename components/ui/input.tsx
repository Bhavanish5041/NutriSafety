import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-2xl border border-emerald-200 bg-white/80 px-4 py-2 text-sm text-shield-forest shadow-sm outline-none transition placeholder:text-emerald-900/40 focus:border-shield-sage focus:ring-2 focus:ring-shield-pastel dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-emerald-100/80 dark:bg-emerald-900/60", className)} />;
}

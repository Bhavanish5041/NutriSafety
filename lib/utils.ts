import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function riskClass(level?: string) {
  if (level === "avoid") return "border-red-200 bg-red-50 text-red-700";
  if (level === "moderate") return "border-yellow-200 bg-yellow-50 text-yellow-800";
  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

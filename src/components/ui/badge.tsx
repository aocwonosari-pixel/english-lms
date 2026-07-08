import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface BadgeProps {
  variant?: "blue" | "green" | "amber" | "red" | "slate";
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = "slate", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-blue-100 text-blue-800": variant === "blue",
          "bg-green-100 text-green-800": variant === "green",
          "bg-amber-100 text-amber-800": variant === "amber",
          "bg-red-100 text-red-800": variant === "red",
          "bg-slate-100 text-slate-800": variant === "slate",
        },
        className
      )}
    >
      {children}
    </span>
  );
}

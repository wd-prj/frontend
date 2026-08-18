import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "gray" | "primary" | "success" | "warning" | "error" | "purple" | "blue";
  size?: "sm" | "md" | "lg";
  withDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "gray",
  size = "md",
  withDot = false,
  children,
  ...props
}) => {
  const variantStyles = {
    gray: "bg-slate-100 text-slate-700 border-slate-200",
    primary: "bg-indigo-50 text-indigo-700 border-indigo-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    error: "bg-rose-50 text-rose-700 border-rose-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    blue: "bg-sky-50 text-sky-700 border-sky-200",
  };

  const dotStyles = {
    gray: "bg-slate-500",
    primary: "bg-indigo-600",
    success: "bg-emerald-600",
    warning: "bg-amber-500",
    error: "bg-rose-600",
    purple: "bg-purple-600",
    blue: "bg-sky-600",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-xs font-medium",
    lg: "px-3 py-1 text-sm font-medium",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {withDot && (
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotStyles[variant])} />
      )}
      {children}
    </span>
  );
};

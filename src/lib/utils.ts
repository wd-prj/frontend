import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDays(val?: number | string | null): string {
  if (val === undefined || val === null || isNaN(Number(val))) return "0";
  const num = Number(val);
  return num % 1 === 0 ? num.toFixed(0) : num.toFixed(1);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function formatDateRange(startDate: string, endDate: string): string {
  if (startDate === endDate) {
    return formatDate(startDate);
  }
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

export function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "REJECTED":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "CANCELLED":
      return "bg-zinc-100 text-zinc-600 border-zinc-200";
    default:
      return "bg-zinc-50 text-zinc-700 border-zinc-200";
  }
}

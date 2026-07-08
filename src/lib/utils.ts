import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getGradeColor(grade: number | null) {
  if (grade === null) return "badge-slate";
  if (grade >= 80) return "badge-green";
  if (grade >= 60) return "badge-amber";
  return "badge-red";
}

export function getStatusBadge(status: string) {
  switch (status) {
    case "submitted":
      return "badge-blue";
    case "graded":
      return "badge-green";
    case "late":
      return "badge-red";
    default:
      return "badge-slate";
  }
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeCssIdentifier(identifier: string): string {
  return identifier.replace(/[^a-zA-Z0-9-_]/g, "");
}

export function isValidCssColor(color: string): boolean {
  // Block potential CSS injection characters and HTML tags
  if (/[{}";'<>]/.test(color)) {
    return false;
  }
  return true;
}

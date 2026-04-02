import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates a CSS color string to prevent CSS injection/XSS.
 * Allows valid formats like hex, rgb, hsl, color names, and css variables,
 * but strictly blocks characters that could break out of the property context or inject HTML.
 */
export function isValidCssColor(color: string): boolean {
  if (/[{}<>";']/.test(color)) {
    return false;
  }
  return true;
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidCssColor(color: string): boolean {
  if (!color) return false;
  // Strictly block characters that could break out of CSS property context
  // or inject new CSS rules or script tags
  return !/[{}[\];"'<>]/g.test(color);
}

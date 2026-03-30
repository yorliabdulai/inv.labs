import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeCssIdentifier(identifier: string) {
  return identifier.replace(/[^a-zA-Z0-9-_]/g, "");
}

export function isValidCssColor(color: string) {
  // Disallow semicolons, braces, and quotes to prevent CSS injection
  if (/[;}{"']/.test(color)) {
    return false;
  }

  // Basic validation to allow hex, functions (rgb, hsl, var), and color names
  const validPattern =
    /^(?:#[0-9a-fA-F]{3,8}|(?:rgb|rgba|hsl|hsla|var)\([^)]+\)|[a-zA-Z]+(?:\s+[a-zA-Z]+)*)$/;

  // Also support composed values like "hsl(var(--chart-1))"
  const composedPattern = /^(?:rgb|rgba|hsl|hsla)\(var\(--[a-zA-Z0-9-_]+\)\)$/;

  const trimmed = color.trim();
  return validPattern.test(trimmed) || composedPattern.test(trimmed);
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitizes an identifier for use in CSS selectors by keeping only
 * alphanumeric characters, dashes, and underscores.
 */
export function sanitizeCssIdentifier(id: string): string {
  if (typeof id !== "string") return "";
  return id.replace(/[^a-zA-Z0-9\-_]/g, "");
}

/**
 * Validates whether a given string is a safe and standard CSS color.
 * Rejects injections containing formatting characters like `;`, `{`, `}`, `\`, `<`, `>`, or newlines.
 */
export function isValidCssColor(color: string): boolean {
  if (typeof color !== "string") return false;

  // Block characters that can break out of a CSS declaration or HTML <style> block
  if (/[;{}"'\\<>]/.test(color) || /[\r\n]/.test(color)) {
    return false;
  }

  // Accept any remaining string. Modern CSS has many color formats
  // (oklch, color(), url(#gradient) for SVGs, etc.) and as long as we
  // prevent breaking out of the declaration or the <style> block itself,
  // the browser will simply ignore invalid CSS values safely.
  return true;
}

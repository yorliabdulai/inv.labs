import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates a CSS color string to prevent CSS injection vulnerabilities.
 * It strictly blocks characters like `{`, `}`, `;`, `<`, `>`, `"`, and `'`.
 * If an invalid string is provided, it returns a fallback color (e.g. "transparent").
 */
export function isValidCssColor(color: string | undefined): string {
  if (!color) return "transparent";

  // Reject if it contains any dangerous characters that could escape the CSS declaration
  // or introduce new tags/attributes
  if (/[{};<>"']/g.test(color)) {
    console.warn(`Blocked potentially unsafe CSS color injection: ${color}`);
    return "transparent";
  }

  return color;
}

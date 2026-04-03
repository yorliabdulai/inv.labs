import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSecureCode(length: number = 8): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const maxValid = Math.floor(256 / charset.length) * charset.length;
  let result = "";
  while (result.length < length) {
    const array = new Uint8Array(1);
    crypto.getRandomValues(array);
    if (array[0] < maxValid) {
      result += charset[array[0] % charset.length];
    }
  }
  return result;
}

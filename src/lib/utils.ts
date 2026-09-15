import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const shell = "mx-auto w-full max-w-7xl px-3 xs:px-4 sm:px-5 lg:px-7";

// Allowlist for admin-entered link targets rendered to every visitor: same-site
// paths or absolute http(s) URLs. Rejects javascript:, data:, and //-relative.
export function isSafeHref(value: string): boolean {
  const href = value.trim();
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  return /^https?:\/\/[^/\s]+(?:\/\S*)?$/i.test(href);
}

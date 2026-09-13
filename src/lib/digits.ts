// Input-specific parsing on top of @/lib/locale/fa's digit conversion.

import { toEnDigits } from "@/lib/locale/fa";

// Accept localized whole numbers; reject malformed input as NaN.
export function parseFaNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return Number.NaN;

  const raw = toEnDigits(value).replace(/[\s,_٬]/g, "");
  if (!raw || !/^\d+$/.test(raw)) return Number.NaN;

  return Number(raw);
}

// Normalizes +98/0098 prefixes to local 0912… digits, stripping spacing/punctuation.
export function phoneDigits(value: string): string {
  const raw = toEnDigits(value).replace(
    /[\s‌‎‏().٫،‐-―_-]/g,
    "",
  );
  if (raw.startsWith("+98")) return `0${raw.slice(3)}`;
  if (raw.startsWith("0098")) return `0${raw.slice(4)}`;
  return raw;
}

// 📱 Form-input digit helpers — parsing/normalizing raw user-typed values.
// Persian digit *conversion* itself lives in `@/lib/locale/fa`; this module
// only builds stricter, input-specific parsing on top of it.

import { toEnDigits } from "@/lib/locale/fa";

/**
 * 🔢 Parse a typed quantity/amount into a number, accepting Persian/Arabic
 * digits and thousands separators. Returns `NaN` for anything that isn't a
 * clean whole number once normalized (stricter than `parseFaPrice`).
 */
export function parseFaNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return Number.NaN;

  const raw = toEnDigits(value).replace(/[\s,_٬]/g, "");
  if (!raw || !/^\d+$/.test(raw)) return Number.NaN;

  return Number(raw);
}

/**
 * ☎️ Normalize a typed phone/identifier to plain local digits (e.g.
 * `+98912…` / `0098912…` → `0912…`), stripping spacing and punctuation.
 */
export function phoneDigits(value: string): string {
  const raw = toEnDigits(value).replace(
    /[\s‌‎‏().٫،‐-―_-]/g,
    "",
  );
  if (raw.startsWith("+98")) return `0${raw.slice(3)}`;
  if (raw.startsWith("0098")) return `0${raw.slice(4)}`;
  return raw;
}

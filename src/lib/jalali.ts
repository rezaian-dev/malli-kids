import { toLatinDigits } from "./digits";

export function jalaliParts(
  input: string,
): { y: number; m: number; d: number } | null {
  const value = toLatinDigits(input)
    .trim()
    .replace(/[.\u200c\-]/g, "/");
  const match = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(value);
  if (!match) return null;

  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);

  if (y < 1300 || y > 1500) return null;
  if (m < 1 || m > 12) return null;
  if (d < 1 || d > (m <= 6 ? 31 : m <= 11 ? 30 : 29)) return null;

  return { y, m, d };
}

export function jalaliToday(): { y: number; m: number; d: number } {
  try {
    const parts = new Intl.DateTimeFormat("en-u-ca-persian", {
      numberingSystem: "latn",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const pick = (type: string) =>
      Number(parts.find((part) => part.type === type)?.value ?? 0);

    return {
      y: pick("year"),
      m: pick("month"),
      d: pick("day"),
    };
  } catch {
    return { y: 1404, m: 1, d: 1 };
  }
}

export function isJalaliFuture(input: string): boolean {
  const value = jalaliParts(input);
  if (!value) return false;

  const today = jalaliToday();
  const current = today.y * 10000 + today.m * 100 + today.d;
  const target = value.y * 10000 + value.m * 100 + value.d;

  return target > current;
}

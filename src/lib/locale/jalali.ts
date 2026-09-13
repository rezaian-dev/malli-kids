import { toEnDigits } from "@/lib/locale/fa";

export function jalaliParts(
  input: string,
): { y: number; m: number; d: number } | null {
  const value = toEnDigits(input)
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

// The one place this app converts Gregorian→Jalali via Intl; other modules build on this.
export function toJalali(d: Date = new Date()): { jy: number; jm: number; jd: number } {
  try {
    const parts = new Intl.DateTimeFormat("en-u-ca-persian", {
      numberingSystem: "latn",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(d);
    const pick = (type: string) =>
      Number(parts.find((part) => part.type === type)?.value ?? 0);

    return {
      jy: pick("year"),
      jm: pick("month"),
      jd: pick("day"),
    };
  } catch {
    return { jy: 1404, jm: 1, jd: 1 };
  }
}

export function isJalaliFuture(input: string): boolean {
  const value = jalaliParts(input);
  if (!value) return false;

  const today = toJalali();
  const current = today.jy * 10000 + today.jm * 100 + today.jd;
  const target = value.y * 10000 + value.m * 100 + value.d;

  return target > current;
}

// Fails closed on malformed dates — money logic must never see garbage as "no expiry"
export function isJalaliPast(input: string): boolean {
  const value = jalaliParts(input);
  if (!value) return true;

  const today = toJalali();
  const current = today.jy * 10000 + today.jm * 100 + today.jd;
  const target = value.y * 10000 + value.m * 100 + value.d;

  return target < current;
}

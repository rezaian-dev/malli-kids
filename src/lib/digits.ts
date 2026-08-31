const faDigits = Array.from({ length: 10 }, (_, i) =>
  String.fromCodePoint(0x06f0 + i),
);
const arDigits = Array.from({ length: 10 }, (_, i) =>
  String.fromCodePoint(0x0660 + i),
);
const FA = faDigits.join("");
const AR = arDigits.join("");

export function toLatinDigits(value: string): string {
  return value
    .replace(/[\u06f0-\u06f9]/g, (digit) => String(FA.indexOf(digit)))
    .replace(/[\u0660-\u0669]/g, (digit) => String(AR.indexOf(digit)));
}

export function parseFaNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return Number.NaN;

  const raw = toLatinDigits(value).replace(/[\s,_٬]/g, "");
  if (!raw || !/^\d+$/.test(raw)) return Number.NaN;

  return Number(raw);
}

export function phoneDigits(value: string): string {
  const raw = toLatinDigits(value).replace(
    /[\s\u200c\u200e\u200f().٫،\u2010-\u2015_-]/g,
    "",
  );
  if (raw.startsWith("+98")) return `0${raw.slice(3)}`;
  if (raw.startsWith("0098")) return `0${raw.slice(4)}`;
  return raw;
}

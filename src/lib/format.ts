export function toFaDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

/** Persian/Arabic-Indic digits → Latin digits. The single source for this conversion. */
export function toEnDigits(value: string | number): string {
  return String(value).replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
}

export function formatToman(n: number): string {
  const raw = Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
  return toFaDigits(raw);
}

export function givenName(name: string): string {
  const t = (name || "").trim();
  if (!t) return "کاربر";
  return t.split(/\s+/)[0];
}

export function fullName(first?: string, last?: string): string {
  return [first, last].filter((p) => (p || "").trim()).join(" ").trim() || givenName(first || "");
}

export function parseFaPrice(fa: string): number {
  return Number(toEnDigits(fa).replace(/[^\d]/g, "")) || 0;
}

/** تاریخِ شمسیِ خوانا برای نمایش (تیکت، سفارش، اعلان) */
export function faNow(): string {
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date());
}

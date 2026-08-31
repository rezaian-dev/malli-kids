
const faInt = new Intl.NumberFormat("fa-IR", { useGrouping: false });
const faGrouped = new Intl.NumberFormat("fa-IR");

export function toFaDigits(value: string | number): string {
  if (value == null || value === "") return "";
  const s = String(value);
  
  if (!/[^\d]/.test(s)) return faInt.format(Number(s));
  
  return s.replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

/** Persian/Arabic-Indic digits → Latin digits. The single source for this conversion. */
export function toEnDigits(value: string | number): string {
  return String(value)
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

export function formatToman(n: number): string {
  return faGrouped.format(Math.round(n));
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

export function faNow(): string {
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date());
}

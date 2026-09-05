// 🇮🇷 Single source for Persian digit conversion, price formatting, and date display; rides native Intl.

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

// ♻️ Instantiated once — Intl formatters are expensive to construct per call.
const faDigitFormatter = new Intl.NumberFormat("fa-IR", { useGrouping: false });
const tomanFormatter = new Intl.NumberFormat("fa-IR");
const faDateTimeFormatter = new Intl.DateTimeFormat("fa-IR", {
  dateStyle: "medium",
  timeStyle: "short",
});
const faDateFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// 🔢 Converts 0-9 to ۰-۹; numeric input routes through Intl.NumberFormat for exact fa-IR output.
export function toFaDigits(value: string | number | null | undefined): string {
  if (value == null || value === "") return "";

  if (typeof value === "number") return faDigitFormatter.format(value);

  return value.replace(/[0-9]/g, (digit) => FA_DIGITS[Number(digit)]);
}

// 🔡 Converts Persian/Arabic-Indic digits to ASCII, leaving other characters untouched.
export function toEnDigits(value: string | number | null | undefined): string {
  if (value == null || value === "") return "";

  return String(value)
    .replace(/[۰-۹]/g, (digit) => String(FA_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(AR_DIGITS.indexOf(digit)));
}

// 💰 Presentation only — internal prices must stay plain numbers.
export function formatToman(amount: number): string {
  return tomanFormatter.format(Math.round(amount));
}

// 🕒 fa-IR date + time, Jalali calendar, Persian digits — e.g. "۲ خرداد ۱۴۰۴، ۱۴:۰۵".
export function faDateTime(input: Date | string | number): string {
  return faDateTimeFormatter.format(new Date(input));
}

// 📅 Jalali YYYY/MM/DD, Persian digits — call at the server boundary; never store the output back in the database.
export function faDate(input: Date | string | number): string {
  return faDateFormatter.format(new Date(input));
}

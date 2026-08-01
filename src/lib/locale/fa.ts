// 🇮🇷 Centralized fa-IR locale layer — the single source for Persian digit
// conversion, price parsing/formatting, and date display across the app.
// No external i18n/number library: everything here rides native Intl.
//
// Layering: digit normalization → parsing → presentation formatting.
// Keep numeric business data as plain numbers until it reaches this module.

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

/**
 * 🔢 Convert ASCII digits (0-9) to Persian digits (۰-۹).
 *
 * String input keeps its original structure (only the `0-9` characters are
 * swapped); numeric input is routed through `Intl.NumberFormat` so it comes
 * out exactly as fa-IR expects.
 */
export function toFaDigits(
  value: string | number | null | undefined,
): string {
  if (value == null || value === "") return "";

  if (typeof value === "number") return faDigitFormatter.format(value);

  return value.replace(/[0-9]/g, (digit) => FA_DIGITS[Number(digit)]);
}

/**
 * 🔡 Convert Persian (۰-۹) and Arabic-Indic (٠-٩) digits to plain ASCII
 * digits, preserving every non-digit character untouched.
 */
export function toEnDigits(
  value: string | number | null | undefined,
): string {
  if (value == null || value === "") return "";

  return String(value)
    .replace(/[۰-۹]/g, (digit) => String(FA_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(AR_DIGITS.indexOf(digit)));
}

/**
 * 💰 Format a Toman amount as a grouped fa-IR string, rounded to the nearest
 * integer. Presentation only — internal prices must stay plain numbers.
 */
export function formatToman(amount: number): string {
  return tomanFormatter.format(Math.round(amount));
}

/**
 * 🧮 Parse a Persian/Arabic-Indic (or mixed) price string back into a plain
 * number: normalize its digits to ASCII, strip everything that isn't a
 * digit, and return `0` for empty/unparseable input.
 */
export function parseFaPrice(value: string | null | undefined): number {
  if (!value) return 0;

  const digitsOnly = toEnDigits(value).replace(/[^\d]/g, "");
  return digitsOnly ? Number(digitsOnly) : 0;
}

/**
 * 🕒 Format "now" as a medium-length fa-IR date + short time string
 * (Jalali calendar, Persian digits) — e.g. "۲ خرداد ۱۴۰۴، ۱۴:۰۵".
 */
/**
 * 🕒 Format any real timestamp as a medium-length fa-IR date + short time
 * string (Jalali calendar, Persian digits) — e.g. "۲ خرداد ۱۴۰۴، ۱۴:۰۵".
 */
export function faDateTime(input: Date | string | number): string {
  return faDateTimeFormatter.format(new Date(input));
}

/**
 * 📅 Format a real (Gregorian) timestamp — stored on every document via
 * Mongoose's own `createdAt` — as a Jalali `YYYY/MM/DD` string, Persian
 * digits (e.g. "۱۴۰۵/۰۶/۰۱"). The one place raw `Date`s become the display
 * strings the rest of the app already expects; call this at the server
 * boundary (data-access functions, action return values), never store its
 * output back in the database.
 */
export function faDate(input: Date | string | number): string {
  return faDateFormatter.format(new Date(input));
}

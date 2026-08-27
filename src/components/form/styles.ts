/**
 * پوسته‌های بصریِ فیلدها.
 *
 * همه‌چیز فقط کلاسِ Tailwind است (هیچ CSS دست‌نویسی این‌جا نیست) و هر پوسته از
 * همان کلاس‌هایی می‌آید که پیش‌تر داخلِ خودِ فرم‌ها تکرار شده بود — پس ظاهرِ سایت
 * عوض نمی‌شود، فقط یک‌جا تعریف می‌شود.
 */
export type Skin = "lux" | "soft" | "admin" | "bare" | "inset";

export const INPUT: Record<Skin, string> = {
  lux: "h-12 rounded-2xl border-gold/40 bg-transparent px-4 text-sm font-semibold text-navy placeholder:text-brown dark:border-gold-soft/50 dark:text-ivory dark:placeholder:text-cream-mute",
  soft: "h-[46px] rounded-2xl border-gold/40 bg-white px-4 text-sm font-semibold dark:bg-dusk-mid dark:text-linen",
  admin: "h-11 rounded-2xl px-4",
  bare: "h-11 w-full bg-transparent px-2 text-base font-bold text-navy outline-none placeholder:text-navy/30 dark:text-ivory dark:placeholder:text-ivory/30",
  inset: "h-full min-w-0 flex-1 border-0 bg-transparent px-4 shadow-none focus-visible:ring-0 aria-invalid:border-0 aria-invalid:ring-0 dark:bg-transparent",
};

export const TEXTAREA: Record<Skin, string> = {
  lux: "min-h-28 rounded-2xl border-gold/40 bg-transparent px-4 py-3 text-sm font-semibold text-navy placeholder:text-brown dark:border-gold-soft/50 dark:text-ivory dark:placeholder:text-cream-mute",
  soft: "min-h-24 rounded-2xl border-gold/40 bg-white px-4 py-3 text-sm font-semibold dark:bg-dusk-mid dark:text-linen",
  admin: "min-h-24 rounded-2xl px-4 py-3",
  bare: "min-h-24 w-full bg-transparent py-2 text-sm font-semibold text-navy outline-none placeholder:text-navy/30 dark:text-ivory",
  inset: "min-h-24 w-full border-0 bg-transparent py-2 text-sm font-semibold shadow-none focus-visible:ring-0 dark:bg-transparent",
};

export const LABEL: Record<Skin, string> = {
  lux: "text-xs font-bold text-navy dark:text-linen",
  soft: "text-sm font-bold text-navy dark:text-linen",
  admin: "text-xs font-black text-navy dark:text-ivory",
  bare: "text-[11px] font-black tracking-[0.16em] text-gold",
  inset: "text-xs font-bold text-navy/80 dark:text-linen",
};

/** پوسته‌هایی که یک «قاب» دورِ کنترل می‌خواهند (خطِ زیرین یا باکس).
 *  یادداشتِ بازر: همین عنصر با `data-field-shell` علامت می‌خورد تا معیارِ سنجشِ
 *  «فاصلهٔ متن تا لبه»، لبهٔ واقعیِ دیدنی باشد نه قابِ خودِ input. */
export const SHELL: Partial<Record<Skin, string>> = {
  bare: "flex items-center gap-3 border-b-2 pb-2 transition-colors",
  inset:
    "flex h-12 items-center rounded-xl border bg-white transition-[border-color,box-shadow] duration-200 border-tan dark:border-white/12 focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/25 data-[invalid=true]:border-rose data-[invalid=true]:dark:border-rose data-[invalid=true]:focus-within:border-rose data-[invalid=true]:focus-within:ring-2 data-[invalid=true]:focus-within:ring-rose/25 dark:bg-navy-deep/60",
};

/** آیکونِ ابتدایِ فیلد در پوسته‌های قاب‌دار */
export const LEAD: Partial<Record<Skin, string>> = {
  inset: "flex w-8 shrink-0 items-center justify-center text-gold dark:text-gold-light",
};

/** لنگرِ مقدارهایِ لاتین در فرمِ rtl (کنارِ dir="ltr" به‌کار می‌رود) */
export const LATIN_ANCHOR = "text-right";

export const SHELL_BARE_IDLE = "border-navy/15 focus-within:border-gold dark:border-gold/25";
export const SHELL_BARE_BAD = "border-rose";

export const ERROR_TEXT = "flex items-start gap-1 text-[11px] font-bold leading-5 text-rose animate-fade-up";
export const HINT_TEXT = "text-[11px] leading-5 text-navy/45 dark:text-wheat";
export const COUNT_TEXT = "text-[10px] font-bold tabular-nums text-navy/35 dark:text-wheat/60";

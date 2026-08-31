export type Skin = "lux" | "soft" | "admin" | "bare" | "inset";

export const INPUT: Record<Skin, string> = {
  lux: "h-12 rounded-2xl border-gold/40 bg-transparent px-4 text-sm font-semibold text-navy placeholder:text-brown dark:border-gold-soft/50 dark:text-ivory dark:placeholder:text-cream-mute",
  soft: "h-[46px] rounded-2xl border-gold/40 bg-transparent px-4 text-sm font-semibold dark:text-linen",
  admin: "h-11 rounded-2xl px-4",
  bare: "h-11 w-full bg-transparent px-2 text-base font-bold text-navy outline-none placeholder:text-navy/30 dark:text-ivory dark:placeholder:text-ivory/30",
  inset:
    "h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-4 py-0 shadow-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:shadow-none aria-invalid:border-0 aria-invalid:ring-0",
};

export const TEXTAREA: Record<Skin, string> = {
  lux: "min-h-28 rounded-2xl border-gold/40 bg-transparent px-4 py-3 text-sm font-semibold text-navy placeholder:text-brown dark:border-gold-soft/50 dark:text-ivory dark:placeholder:text-cream-mute",
  soft: "min-h-24 rounded-2xl border-gold/40 bg-transparent px-4 py-3 text-sm font-semibold dark:text-linen",
  admin: "min-h-24 rounded-2xl px-4 py-3",
  bare: "min-h-24 w-full bg-transparent py-2 text-sm font-semibold text-navy outline-none placeholder:text-navy/30 dark:text-ivory",
  inset:
    "min-h-24 w-full rounded-[inherit] border-0 bg-transparent py-2 text-sm font-semibold shadow-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:shadow-none",
};

export const LABEL: Record<Skin, string> = {
  lux: "text-xs font-bold text-navy dark:text-linen",
  soft: "text-sm font-bold text-navy dark:text-linen",
  admin: "text-xs font-black text-navy dark:text-ivory",
  bare: "text-[11px] font-black tracking-[0.16em] text-gold",
  inset: "text-xs font-bold text-navy/80 dark:text-linen",
};

export const SHELL: Partial<Record<Skin, string>> = {
  bare: "flex items-center gap-3 border-b-2 pb-2 transition-colors",
  inset:
    "relative flex h-12 items-center overflow-hidden rounded-xl border border-tan bg-white/80 shadow-[0_14px_40px_-18px_rgba(14,42,71,0.22),0_0_24px_-10px_rgba(193,147,87,0.2)] transition-[border-color,box-shadow] duration-200 focus-within:border-gold/60 focus-within:shadow-[0_18px_50px_-14px_rgba(193,147,87,0.48),0_0_0_4px_rgba(193,147,87,0.16)] data-[invalid=true]:border-rose data-[invalid=true]:focus-within:border-rose data-[invalid=true]:focus-within:shadow-[0_18px_50px_-14px_rgba(225,29,72,0.28),0_0_0_4px_rgba(225,29,72,0.14)] data-[invalid=true]:dark:border-rose dark:border-white/12 dark:bg-navy-deep/60 dark:shadow-[0_16px_44px_-18px_rgba(0,0,0,0.45),0_0_24px_-12px_rgba(193,147,87,0.18)] dark:focus-within:shadow-[0_18px_50px_-14px_rgba(232,197,122,0.32),0_0_0_4px_rgba(232,197,122,0.16)]",
};

export const LEAD: Partial<Record<Skin, string>> = {
  inset:
    "flex w-8 shrink-0 items-center justify-center text-gold dark:text-gold-light",
};

export const LATIN_ANCHOR = "text-right";

export const SHELL_BARE_IDLE =
  "border-navy/15 focus-within:border-gold focus-within:shadow-[0_18px_50px_-14px_rgba(193,147,87,0.48),0_0_0_4px_rgba(193,147,87,0.16)] dark:border-gold/25 dark:focus-within:shadow-[0_18px_50px_-14px_rgba(232,197,122,0.32),0_0_0_4px_rgba(232,197,122,0.16)]";
export const SHELL_BARE_BAD = "border-rose";

export const ERROR_TEXT =
  "flex items-start gap-1 text-[11px] font-bold leading-5 text-rose animate-fade-up";
export const HINT_TEXT = "text-[11px] leading-5 text-navy/45 dark:text-wheat";
export const COUNT_TEXT =
  "text-[10px] font-bold tabular-nums text-navy/35 dark:text-wheat/60";

import { phoneDigits, toLatinDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

/** ☎️ Normalize a typed phone/identifier to plain digits. */
export const digits = (v: string) => phoneDigits(v);

/** 🔢 Strip everything but digits (Latin) from an OTP code field. */
export const onlyDigits = (v: string) => toLatinDigits(v).replace(/\D/g, "");

export const SUBMIT_NAVY = cn(
  "h-12 w-full gap-2 rounded-full font-black transition-transform active:scale-99",
  "bg-navy text-ivory shadow-[0_10px_24px_-12px] shadow-navy/60 hover:bg-navy-mid",
  "dark:bg-gold dark:text-navy-deep dark:shadow-gold/40 dark:hover:bg-gold-light",
);

export const SUBMIT_GOLD = cn(
  "h-12 w-full gap-2 rounded-full font-black transition-transform active:scale-99",
  "bg-gold text-navy-deep shadow-[0_10px_24px_-12px] shadow-gold/60 hover:bg-gold-light",
);

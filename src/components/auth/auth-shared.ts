"use client";

import { useEffect, useState } from "react";
import { toEnDigits } from "@/lib/locale/fa";

/** 🔢 Strip everything but digits (Latin) from an OTP code field. */
export const onlyDigits = (v: string) => toEnDigits(v).replace(/\D/g, "");

/** ⏱️ A simple "restart a countdown, tick every second" timer — shared by
 *  the two auth flows with a resend/retry wait (OTP codes, forgot-password
 *  emails). Lives here rather than in `src/hooks` since both consumers are
 *  this one feature. */
export function useCooldown() {
  const [sec, setSec] = useState(0);

  useEffect(() => {
    if (sec <= 0) return;
    const t = window.setTimeout(() => setSec((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [sec]);

  return { sec, restart: (n = 90) => setSec(n), stop: () => setSec(0) };
}

export const SUBMIT_NAVY = "h-12 w-full gap-2 rounded-full font-black transition-transform active:scale-99 bg-navy text-ivory shadow-[0_10px_24px_-12px] shadow-navy/60 hover:bg-navy-mid dark:bg-gold dark:text-navy-deep dark:shadow-gold/40 dark:hover:bg-gold-light";

export const SUBMIT_GOLD = "h-12 w-full gap-2 rounded-full font-black transition-transform active:scale-99 bg-gold text-navy-deep shadow-[0_10px_24px_-12px] shadow-gold/60 hover:bg-gold-light";

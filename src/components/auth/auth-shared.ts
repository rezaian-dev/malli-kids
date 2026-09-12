"use client";

import { useCallback, useEffect, useState } from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { toEnDigits } from "@/lib/locale/fa";
import type { ActionResult } from "@/lib/action-result";
import { OTP_RESEND_SECONDS } from "@/lib/auth/schemas";

export const onlyDigits = (v: string) => toEnDigits(v).replace(/\D/g, "");

/** Wall-clock countdown stays correct after a backgrounded/suspended mobile tab. */
export function useCooldown() {
  const [until, setUntil] = useState(0);
  const [sec, setSec] = useState(0);
  const restart = useCallback((n = OTP_RESEND_SECONDS) => {
    setSec(n);
    setUntil(Date.now() + n * 1000);
  }, []);
  const stop = useCallback(() => {
    setUntil(0);
    setSec(0);
  }, []);

  useEffect(() => {
    if (!until) return;
    const update = () =>
      setSec(Math.max(0, Math.ceil((until - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, [until]);
  return { sec, restart, stop };
}

export function reportAuthError<T extends FieldValues>(
  form: UseFormReturn<T>,
  result: Extract<ActionResult, { ok: false }>,
) {
  const field =
    result.field && Object.hasOwn(form.getValues(), result.field)
      ? (result.field as FieldPath<T>)
      : "root.server";
  form.setError(field, { type: "server", message: result.error });
}

export const SUBMIT_NAVY =
  "h-12 w-full gap-2 rounded-full font-black transition-transform active:scale-99 bg-navy text-ivory shadow-[0_10px_24px_-12px] shadow-navy/60 hover:bg-navy-mid dark:bg-gold dark:text-navy-deep dark:shadow-gold/40 dark:hover:bg-gold-light";
export const SUBMIT_GOLD =
  "h-12 w-full gap-2 rounded-full font-black transition-transform active:scale-99 bg-gold text-navy-deep shadow-[0_10px_24px_-12px] shadow-gold/60 hover:bg-gold-light";

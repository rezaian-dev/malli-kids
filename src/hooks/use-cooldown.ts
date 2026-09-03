"use client";

import { useEffect, useState } from "react";

/** ⏱️ A simple "restart a countdown, tick every second" timer — shared by
 *  any flow with a resend/retry wait (forgot-password emails today). */
export function useCooldown() {
  const [sec, setSec] = useState(0);

  useEffect(() => {
    if (sec <= 0) return;
    const t = window.setTimeout(() => setSec((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [sec]);

  return { sec, restart: (n = 90) => setSec(n), stop: () => setSec(0) };
}

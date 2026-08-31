"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

/**
 * نقطهٔ اتصالِ مودالِ ورود/ثبت‌نام.
 *
 * خودِ مودال سنگین است (فرم‌ها، اسکیمای zod، ورودیِ کدِ پیامکی) و در ۹۹٪ بازدیدها
 * اصلاً باز نمی‌شود؛ پس به‌جای اینکه در باندلِ اولیهٔ هر صفحه بنشیند، فقط:
 *   ۱) با اولین باز شدن، on-demand بارگذاری می‌شود، و
 *   ۲) در زمانِ بی‌کاریِ مرورگر (requestIdleCallback) از قبل prefetch می‌شود
 *      تا کلیکِ کاربر هیچ تأخیری حس نکند.
 * بعد از اولین mount، مونت می‌مانَد تا انیمیشنِ بسته‌شدن طبیعی باشد.
 */
const AuthModal = dynamic(() => import("./auth-modal").then((m) => m.Modal), { ssr: false });

export function Modal() {
  const { authOpen } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (authOpen) setMounted(true);
  }, [authOpen]);

  useEffect(() => {
    if (mounted) return;
    const preload = () => void import("./auth-modal");
    const idle = typeof window.requestIdleCallback === "function";
    const id = idle ? window.requestIdleCallback(preload, { timeout: 4000 }) : window.setTimeout(preload, 2500);
    return () => {
      if (idle) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
  }, [mounted]);

  return mounted ? <AuthModal /> : null;
}

import { ShieldCheck } from "lucide-react";

/**
 * پانوشت اطمینان‌بخش پای فرم‌های ورود.
 *
 * فضای خالی زیر دکمه را با یک پیام کوتاه امنیتی پر می‌کند تا کاربر
 * قبل از دادن شمارهٔ موبایل خیالش راحت باشد. کاملاً ایستا → Server Component.
 */
export function TrustNote() {
  return (
    <p
      className="mt-1 flex items-center justify-center gap-1.5 rounded-xl bg-navy/[0.04] px-3 py-2 text-[10.5px] font-bold text-navy/55 dark:bg-white/[0.04] dark:text-linen/60"
      dir="rtl"
    >
      <ShieldCheck className="size-3.5 shrink-0 text-gold" />
      اطلاعات شما نزد ملی‌کیدز محفوظ است و هرگز به اشتراک گذاشته نمی‌شود.
    </p>
  );
}

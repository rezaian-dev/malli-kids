import { ShieldCheck } from "lucide-react";

export function TrustNote() {
  return (
    <p
      className="mt-1 flex items-center justify-center gap-1.5 rounded-xl bg-navy/4 px-3 py-2 text-[10.5px] font-bold text-navy/55 dark:bg-white/4 dark:text-linen/60"
      dir="rtl"
    >
      <ShieldCheck className="size-3.5 shrink-0 text-gold" />
      اطلاعات شما نزد ملی‌کیدز محفوظ است و هرگز به اشتراک گذاشته نمی‌شود.
    </p>
  );
}

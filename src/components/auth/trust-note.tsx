import { ShieldCheck } from "lucide-react";

export function TrustNote() {
  return (
    <p
      className="bg-navy/4 text-navy/55 dark:text-linen/60 mt-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[10.5px] font-bold dark:bg-white/4"
      dir="rtl"
    >
      <ShieldCheck className="text-gold size-3.5 shrink-0" />
      اطلاعات شما نزد ملی‌کیدز محفوظ است و هرگز به اشتراک گذاشته نمی‌شود.
    </p>
  );
}

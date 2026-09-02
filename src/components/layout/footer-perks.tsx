import { Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { cn, shell } from "@/lib/utils";

const PERKS = [
  { Icon: Truck, t: "ارسال سریع", d: "سراسر کشور · ۲ تا ۴ روز کاری" },
  {
    Icon: ShieldCheck,
    t: "پارچه ضدحساسیت",
    d: "گواهی OEKO-TEX برای پوست کودک",
  },
  { Icon: RotateCcw, t: "۷ روز بازگشت", d: "بدون قید و شرط" },
  { Icon: Headphones, t: "پشتیبانی مادری", d: "مشاوره سایز، هر روز هفته" },
];

/** ✅ The four trust perks strip at the top of the footer. */
export function FooterPerks() {
  return (
    <div className="border-b border-white/10">
      <div
        className={`${shell} grid grid-cols-[repeat(auto-fit,minmax(13.75rem,1fr))] gap-5 py-9 sm:py-11`}
      >
        {PERKS.map(({ Icon, t, d }) => (
          <div key={t} className="flex min-w-0 items-center gap-3.5">
            <span
              className={cn(
                "inline-flex size-11 shrink-0 items-center justify-center",
                "text-gold rounded-full bg-white/10",
              )}
            >
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="m-0 text-sm font-bold text-white">{t}</p>
              <p className="text-taupe mt-1 text-xs leading-snug">{d}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { Camera, Handshake, Scissors, Store, Megaphone } from "lucide-react";
import { Intro } from "@/components/shared/intro";
import { CollabForm } from "./_components/collab-form";

export const metadata: Metadata = {
  title: "همکاری با مالی‌کیدز",
  description: "خرید عمده، دوخت و تولید، تولید محتوا، عکاسی و مدلینگ — فرم درخواست همکاری با مالی‌کیدز.",
};

const KINDS = [
  { Icon: Store, t: "خرید عمده و نمایندگی", d: "فروشگاه کودک و سیسمونی‌فروشی؟ قیمتِ همکاری و کالکشنِ عمده برایتان می‌فرستیم." },
  { Icon: Scissors, t: "همکاری در دوخت و تولید", d: "خیاط و طراح الگو؛ دوختِ قصه‌های ملی‌کیدز با شما، اعتبار و فروش با ما." },
  { Icon: Megaphone, t: "تولید محتوا و بلاگر", d: "مادرِ بلاگر یا ادمینِ حرفه‌ای؟ کمپینِ مشترک و کدِ تخفیف اختصاصی." },
  { Icon: Camera, t: "عکاسی و مدلینگ", d: "عکاسِ کودک یا کوچولوی مدل؛ لوک‌بوکِ هر کالکشن با تیم شما." },
];

/**
 * صفحهٔ همکاری — Server Component.
 * کلِ محتوای ایستا (معرفی، چهار کارت، پوستهٔ فرم) روی سرور رندر می‌شود؛
 * فقط <CollabForm /> کلاینت است چون اعتبارسنجی و ثبتِ درخواست نیاز به تعامل دارد.
 */
export default function CollabPage() {
  return (
    <>
      <Intro
        crumb="همکاری"
        kicker="با هم بزرگ می‌شویم"
        title="همکاری با مالی‌کیدز"
        lead="از خیاط‌خانه‌های تهران تا بلاگرهای مادر؛ اگر دلتان برای قصهٔ کوچولوها می‌تپد، جایتان در کنار ما خالی است."
      />

      <div className="container mx-auto w-full max-w-5xl space-y-9 px-4 sm:px-5 lg:px-7">
        <section className="grid gap-4 sm:grid-cols-2">
          {KINDS.map(({ Icon, t, d }) => (
            <div key={t} className="rounded-[26px] border border-navy/8 bg-white/94 shadow-[0_18px_40px_-26px_rgba(14,42,71,.28)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_22px_44px_-22px_rgba(193,147,87,.28)] dark:border-gold/30 dark:bg-slate/60 flex items-start gap-4 p-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gold/15 text-gold">
                <Icon className="size-5" />
              </span>
              <div>
                <h2 className="font-black text-navy dark:text-ivory">{t}</h2>
                <p className="mt-1.5 text-xs leading-6 text-navy/55 dark:text-wheat">{d}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-[26px] border border-navy/8 bg-white/94 shadow-[0_18px_40px_-26px_rgba(14,42,71,.28)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_22px_44px_-22px_rgba(193,147,87,.28)] dark:border-gold/30 dark:bg-slate/60 p-6 sm:p-8">
          <p className="flex items-center gap-2 text-[11px] font-black tracking-[0.22em] text-gold">
            <Handshake className="size-4" /> فرمِ درخواست
          </p>
          <h2 className="font-black leading-snug text-navy dark:text-ivory mt-2 text-xl">برای شروع، خودتان را معرفی کنید</h2>
          <p className="text-navy/55 dark:text-wheat mt-2 text-sm leading-7">فرم را پر کنید؛ تیم همکاری‌ها حداکثر تا ۲ روز کاری با شما تماس می‌گیرد.</p>

          <CollabForm />
        </section>
      </div>
    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ScanFace, Sparkles, WandSparkles } from "lucide-react";
import lookTryon from "../../../../public/brand/look-tryon.jpg";
import { OrnRing } from "@/components/home/home-ornaments";

const STEPS = [
  {
    Icon: ScanFace,
    t: "اسکن هوشمند چهره و اندام",
    d: "تشخیص دقیق فرم بدن کودک در چند ثانیه",
  },
  {
    Icon: ScanFace,
    t: "پیشنهاد سایز دقیق",
    d: "بدون سانت و خیاط؛ سایز درست، بار اول",
  },
  {
    Icon: WandSparkles,
    t: "پیش‌نمایش زنده لباس",
    d: "هر مدل را روی فرزندتان ببینید، قبل از خرید",
  },
];

export function TryOn() {
  return (
    <section id="tryon" className="bg-transparent py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7">
        <div className="bg-navy shadow-navy/30 relative overflow-hidden rounded-3xl bg-[radial-gradient(rgba(255,255,255,.09)_1px,transparent_1px)] bg-size-[22px_22px] shadow-2xl transition-all duration-700 ease-out sm:rounded-[36px]">
          <div className="bg-gold/20 pointer-events-none absolute -top-40 -right-40 h-120 w-120 rounded-full blur-3xl" />
          <div className="bg-navy-soft/40 pointer-events-none absolute -bottom-52 -left-32 h-105 w-105 rounded-full blur-3xl" />
          <div className="relative grid items-center gap-10 p-6 min-[420px]:p-8 sm:p-12 lg:grid-cols-2 lg:gap-8 lg:p-16">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/15 px-3.5 py-1.5 sm:mb-6 sm:px-4 sm:py-2">
                <Sparkles className="text-gold-light h-4 w-4 shrink-0" />
                <span className="text-xs font-bold text-gold-light sm:text-sm">
                  تکنولوژی اختصاصی ملی‌کیدز
                </span>
              </div>
              <h2 className="text-[clamp(1.5rem,5.5vw,2.75rem)] leading-[1.35] font-black text-white">
                اتاق پرو{" "}
                <span className="relative inline-block">
                  دیجیتال
                  <OrnRing className="absolute -top-3 -left-5 h-6 w-6 opacity-80" />
                </span>
              </h2>
              <p className="mt-2 text-sm font-bold text-gold-light">
                عکس + لباس کالکشن + سایز پیشنهادی
              </p>
              <p className="mt-4 max-w-lg text-sm leading-7 text-cream/65 sm:mt-5 sm:text-base sm:leading-8">
                دیگر لازم نیست برای پرو لباس، کوچولویتان را به مغازه ببرید. با
                دوربین گوشی، لباس را به‌صورت زنده روی تن او ببینید و با خیال
                راحت سایز درست را انتخاب کنید.
              </p>
              <div className="mt-7 space-y-4 sm:mt-8 sm:space-y-5">
                {STEPS.map(({ Icon, t, d }) => (
                  <div key={t} className="flex items-start gap-3 sm:gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/25 bg-gold/15 sm:h-11 sm:w-11 sm:rounded-2xl">
                      <Icon className="text-gold-light h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white sm:text-base">{t}</h4>
                      <p className="mt-1 text-xs text-cream/50 sm:text-sm">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-col flex-wrap gap-3 min-[420px]:flex-row sm:mt-10 sm:gap-4">
                <Link
                  href="/tryon"
                  prefetch={false}
                  className="relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gold px-7 py-3.5 text-sm font-black text-navy-deep shadow-lg shadow-gold/25 transition-all duration-500 hover:-translate-y-1 hover:bg-gold-light sm:px-8 sm:py-4 sm:text-base"
                >
                  <Sparkles className="relative h-5 w-5" />
                  <span className="relative">شروع پرو مجازی</span>
                </Link>
                <Link
                  href="/tryon"
                  prefetch={false}
                  className="relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border border-cream/30 px-6 py-3.5 text-sm font-bold text-cream transition-all duration-500 hover:-translate-y-1 hover:bg-white/10 sm:px-7 sm:py-4 sm:text-base"
                >
                  ورود به اتاق پرو
                </Link>
              </div>
            </div>
            <div className="relative mt-2 lg:mt-0">
              <div className="relative overflow-hidden rounded-2xl border border-white/15 shadow-2xl sm:rounded-[28px]">
                <Image
                  src={lookTryon}
                  alt="پرو مجازی با هوش مصنوعی"
                  width={800}
                  height={600}
                  loading="eager"
                  fetchPriority="high"
                  placeholder="blur"
                  sizes="(max-width: 1023px) 100vw, 44vw"
                  className="aspect-4/3 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-navy-deep/80 via-transparent to-navy/20" />
                <div className="animate-scan via-gold/25 absolute inset-x-0 h-16 bg-linear-to-b from-transparent to-transparent" />
                <div className="border-gold-light absolute top-4 right-4 h-8 w-8 rounded-tr-lg border-t-2 border-r-2 sm:top-5 sm:right-5 sm:h-10 sm:w-10" />
                <div className="border-gold-light absolute top-4 left-4 h-8 w-8 rounded-tl-lg border-t-2 border-l-2 sm:top-5 sm:left-5 sm:h-10 sm:w-10" />
                <div className="border-gold-light absolute right-4 bottom-4 h-8 w-8 rounded-br-lg border-r-2 border-b-2 sm:right-5 sm:bottom-5 sm:h-10 sm:w-10" />
                <div className="border-gold-light absolute bottom-4 left-4 h-8 w-8 rounded-bl-lg border-b-2 border-l-2 sm:bottom-5 sm:left-5 sm:h-10 sm:w-10" />
                <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-2 sm:inset-x-5 sm:bottom-5">
                  <div className="min-w-0 rounded-xl border border-white/10 bg-navy-deep px-3 py-2 sm:rounded-2xl sm:px-4 sm:py-3">
                    <p className="text-[10px] font-bold text-gold-light sm:text-xs">در حال تحلیل…</p>
                    <p className="mt-0.5 text-xs font-bold whitespace-nowrap text-white sm:mt-1 sm:text-sm">
                      تطبیق سایز: ۹۸٪
                    </p>
                  </div>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold shadow-lg shadow-gold/40 sm:h-12 sm:w-12">
                    <ScanFace className="h-5 w-5 text-navy-deep sm:h-6 sm:w-6" />
                  </span>
                </div>
              </div>
              <div className="animate-floaty absolute -top-3 right-3 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-xl sm:-top-5 sm:right-8 sm:px-5 sm:py-2.5">
                <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500 sm:h-2.5 sm:w-2.5" />
                <span className="text-[11px] font-bold whitespace-nowrap text-navy sm:text-sm">
                  AI آنلاین است
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Scissors, ShieldCheck, Sparkles, Star } from "lucide-react";
import heroDress from "../../../../public/brand/hero-dress.jpg";
import { GoldMark, OrnStar } from "@/components/home/home-ornaments";

export function Hero() {
  return (
    <section
      id="heroSection"
      className="relative overflow-hidden bg-transparent pt-8 pb-14 sm:pt-12 sm:pb-20 lg:pt-14 lg:pb-24"
    >
      <div className="bg-gold/25 xs:size-88 pointer-events-none absolute -inset-s-20 -top-24 size-72 animate-pulse rounded-full blur-[70px]" />
      <div className="bg-navy/10 xs:size-96 pointer-events-none absolute -inset-e-24 top-32 size-80 animate-pulse rounded-full blur-[70px]" />
      <span className="font-display pointer-events-none absolute inset-e-[5%] top-[22%] hidden rotate-6 text-[130px] leading-none text-transparent select-none [-webkit-text-stroke:1.5px_rgba(196,163,106,.55)] xl:block">
        kids
      </span>
      <div className="relative container mx-auto grid w-full items-center gap-12 px-4 sm:px-5 lg:grid-cols-2 lg:gap-8 lg:px-7">
        <div className="relative z-10 text-center lg:text-right">
          <div className="animate-hero-in mb-6 inline-flex items-center gap-2 rounded-full border-[1.5px] border-gold bg-white px-3.5 py-1.5 text-navy shadow-[0_8px_24px_-12px_rgba(193,147,87,.7)] transition-transform delay-75 duration-500 hover:-translate-y-0.5 dark:bg-linen dark:text-navy sm:mb-7 sm:px-4 sm:py-2">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span className="text-xs font-semibold sm:text-sm">
              کالکشن جدید پاییز – زمستان ۱۴۰۴
            </span>
          </div>
          <h1 className="animate-hero-in text-[clamp(1.75rem,7vw,4rem)] leading-[1.3] font-black text-navy delay-150 dark:text-linen">
            دنیای شیکِ
            <span className="text-gold relative mx-1.5 inline-block sm:mx-3">
              کوچولوها
              <GoldMark className="absolute right-0 -bottom-1.5 w-full sm:-bottom-2" />
              <span
                className="animate-twinkle bg-gold absolute -top-1 -left-2 size-2 rounded-full shadow-[0_0_0_3px_rgba(193,147,87,0.18)]"
                aria-hidden
              />
              <OrnStar className="absolute -top-3 -left-4 h-4 w-4 sm:h-5 sm:w-5" />
            </span>
            <br />
            از نخ تا تن‌پوش، با عشق
          </h1>
          <p className="animate-hero-in mx-auto mt-6 max-w-xl text-[15px] leading-7 text-navy/60 delay-300 dark:text-khaki sm:mt-7 sm:text-lg sm:leading-8 lg:mx-0">
            ملی‌کیدز؛ بوتیک تخصصی پوشاک کودک با پارچه‌های ارگانیک، دوخت‌های دستی
            و تجربه پرو مجازی با هوش مصنوعی — برای لحظه‌هایی که قرار است در
            خاطره‌ها بمانند.
          </p>
          <div className="animate-hero-in mt-8 flex flex-col flex-wrap items-stretch justify-center gap-3 delay-500 min-[420px]:flex-row min-[420px]:items-center sm:mt-9 sm:gap-4 lg:justify-start">
            <Link
              href="/#styles"
              prefetch={false}
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-linear-to-l from-navy via-navy-mid to-navy px-8 py-3.5 text-sm font-black text-cream shadow-[0_12px_28px_-8px_rgba(14,42,71,.45)] ring-2 ring-gold/40 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.05] hover:shadow-[0_18px_40px_-10px_rgba(193,147,87,.6)] hover:ring-gold sm:px-9 sm:py-4 sm:text-base"
            >
              <span
                className="bg-gold/25 pointer-events-none absolute -inset-2 animate-pulse rounded-full opacity-70 blur-md"
                aria-hidden
              />
              <span
                className="animate-shimmer pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(232,197,122,.55)_48%,transparent_76%)]"
                aria-hidden
              />
              <Sparkles className="animate-twinkle text-gold relative h-4 w-4" />
              <span className="relative tracking-wide">مشاهده کالکشن</span>
              <ArrowLeft className="relative h-5 w-5 transition-transform duration-500 group-hover:-translate-x-2" />
            </Link>
            <Link
              href="/tryon"
              prefetch={false}
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border-2 border-gold bg-gold px-8 py-3 text-sm font-black text-navy-deep shadow-[0_0_28px_rgba(193,147,87,.45)] transition-all duration-500 hover:-translate-y-2 hover:scale-[1.05] hover:bg-gold-light hover:shadow-[0_18px_40px_-10px_rgba(193,147,87,.7)] sm:px-9 sm:py-3.75 sm:text-base"
            >
              <span
                className="border-gold pointer-events-none absolute -inset-1 animate-ping rounded-full border opacity-40"
                aria-hidden
              />
              <span
                className="animate-shimmer pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,.65)_50%,transparent_76%)]"
                aria-hidden
              />
              <Sparkles className="animate-orn-spin relative h-5 w-5" />
              <span className="relative tracking-wide">پرو مجازی با AI</span>
            </Link>
          </div>
          <div className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-2 min-[420px]:gap-6 sm:mt-12 sm:gap-10 lg:mx-0 lg:flex lg:max-w-none lg:items-center lg:justify-start">
            <div className="animate-hero-in min-w-0 text-center delay-200 lg:text-right">
              <div className="text-base font-black text-navy min-[380px]:text-xl dark:text-ivory sm:text-3xl">
                +۱۲٬۰۰۰
              </div>
              <div className="mt-1 text-[10px] leading-4 text-navy/50 min-[380px]:text-xs dark:text-wheat sm:text-sm">
                مادر خوشحال
              </div>
            </div>
            <div className="animate-hero-in min-w-0 text-center delay-300 lg:text-right">
              <div className="text-base font-black text-navy min-[380px]:text-xl dark:text-ivory sm:text-3xl">
                +۳۵۰
              </div>
              <div className="mt-1 text-[10px] leading-4 text-navy/50 min-[380px]:text-xs dark:text-wheat sm:text-sm">
                مدل اختصاصی
              </div>
            </div>
            <div className="animate-hero-in min-w-0 text-center lg:text-right">
              <div className="flex items-center justify-center gap-1 text-base font-black text-navy min-[380px]:text-xl dark:text-ivory sm:text-3xl lg:justify-start">
                ۴٫۹
                <Star className="fill-gold text-gold h-3.5 w-3.5 shrink-0 sm:h-5 sm:w-5" />
              </div>
              <div className="mt-1 text-[10px] leading-4 text-navy/50 min-[380px]:text-xs dark:text-wheat sm:text-sm">
                امتیاز خرید
              </div>
            </div>
          </div>
        </div>
        <div className="group/hero animate-hero-in xs:max-w-[20rem] xs:px-4 relative mx-auto w-full max-w-[18rem] px-2 delay-200 sm:max-w-110 sm:px-0">
          <div className="bg-sand shadow-navy/20 dark:border-linen relative aspect-3/4 overflow-hidden rounded-t-[999px] rounded-b-4xl border-8 border-white shadow-2xl sm:rounded-b-[40px] sm:border-10">
            <Image
              src={heroDress}
              alt="پیراهن مجلسی دخترانه ملی‌کیدز"
              width={900}
              height={1200}
              preload
              placeholder="blur"
              sizes="(max-width: 639px) 18rem, (max-width: 1023px) 27.5rem, 45vw"
              className="animate-hero-ken h-full w-full origin-[58%_38%] object-cover"
            />
            <div
              className="animate-shimmer pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_32%,rgba(255,255,255,.38)_48%,transparent_62%)]"
              aria-hidden
            />
            <div className="absolute inset-0 bg-linear-to-t from-navy/25 via-transparent to-transparent" />
          </div>
          <div className="animate-orn-sway absolute -inset-3 -z-10 rounded-t-[999px] rounded-b-[40px] border-2 border-dashed border-gold/50 sm:-inset-5 sm:rounded-b-[48px]" />
          <div className="animate-floaty shadow-navy/15 absolute top-14 -right-1 flex max-w-50 items-center gap-2 rounded-xl bg-white p-2.5 shadow-xl min-[420px]:-right-4 sm:top-16 sm:-right-10 sm:max-w-57.5 sm:gap-3 sm:rounded-2xl sm:p-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold sm:h-12 sm:w-12">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0 text-right">
              <p className="text-[10px] font-black text-navy sm:text-xs">پارچه ضدحساسیت</p>
              <p className="mt-0.5 text-[10px] leading-4 text-navy/50 sm:text-[11px]">
                گواهی OEKO-TEX برای پوست کودک
              </p>
            </div>
          </div>
          <div className="animate-floaty-slow bg-navy text-cream shadow-navy/30 absolute bottom-20 -left-1 rounded-xl px-3.5 py-2.5 shadow-xl min-[420px]:-left-3 sm:bottom-24 sm:-left-8 sm:rounded-2xl sm:px-5 sm:py-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Scissors className="text-gold h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs font-bold sm:text-sm">دوخت اختصاصی</span>
            </div>
            <p className="mt-1 hidden text-[10px] text-cream/60 min-[420px]:block sm:text-[11px]">
              متناسب با سایز فرزند شما
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

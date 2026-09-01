import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Scissors, ShieldCheck, Sparkles, Star } from "lucide-react";
import heroDress from "../../../../public/brand/hero-dress.jpg";
import { GoldMark, OrnStar } from "@/components/home/home-ornaments";
import { wash } from "@/components/home/section-wash";
import { cn } from "@/lib/utils";

const STAT_VALUE = cn(
  "text-base font-black min-[380px]:text-xl sm:text-3xl",
  "text-navy",
  "dark:text-ivory",
);

const STAT_LABEL = cn(
  "mt-1 text-[10px] leading-4 min-[380px]:text-xs sm:text-sm",
  "text-navy/70",
  "dark:text-wheat",
);

export function Hero() {
  return (
    <section
      id="heroSection"
      className={`${wash.gold} pt-8 pb-14 sm:pt-12 sm:pb-20 lg:pt-14 lg:pb-24`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden dark:hidden">
        <div
          className={cn(
            "animate-silk-glow xs:size-88 pointer-events-none absolute -inset-s-16 -top-28 size-72 rounded-full blur-[56px]",
            "bg-gold/32",
          )}
        />
        <div
          className={cn(
            "xs:size-96 pointer-events-none absolute -inset-e-20 top-24 size-80 rounded-full blur-3xl",
            "bg-navy/16",
          )}
        />
        <div
          className={cn(
            "animate-silk-glow pointer-events-none absolute inset-s-[28%] bottom-[-10%] size-72 rounded-full blur-[52px] [animation-delay:-7s]",
            "bg-gold-soft/24",
          )}
        />
      </div>
      <span
        className={cn(
          "pointer-events-none absolute inset-e-[5%] top-[22%] hidden rotate-6 select-none xl:block",
          "font-display text-[130px] leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(196,163,106,.55)]",
        )}
      >
        kids
      </span>
      <div className="relative container mx-auto grid w-full items-center gap-12 px-4 sm:px-5 lg:grid-cols-2 lg:gap-8 lg:px-7">
        <div className="relative z-10 text-center lg:text-right">
          <div
            className={cn(
              "animate-hero-in mb-6 inline-flex items-center gap-2 rounded-full border-[1.5px] px-3.5 py-1.5 transition-transform delay-75 duration-500 hover:-translate-y-0.5 sm:mb-7 sm:px-4 sm:py-2",
              "border-gold text-navy bg-white shadow-[0_8px_24px_-12px_rgba(193,147,87,.7)]",
              "dark:bg-linen dark:text-navy",
            )}
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            <span className="text-xs font-semibold sm:text-sm">
              کالکشن جدید پاییز – زمستان ۱۴۰۴
            </span>
          </div>
          <h1
            className={cn(
              "animate-hero-in delay-150",
              "text-navy text-[clamp(1.75rem,7vw,4rem)] leading-[1.3] font-black",
              "dark:text-linen",
            )}
          >
            دنیای شیکِ
            <span className="text-gold relative mx-1.5 inline-block sm:mx-3">
              کوچولوها
              <GoldMark className="absolute right-0 -bottom-1.5 w-full sm:-bottom-2" />
              <span
                className={cn(
                  "animate-twinkle absolute -top-1 -left-2 size-2 rounded-full",
                  "bg-gold shadow-[0_0_0_3px_rgba(193,147,87,0.18)]",
                )}
                aria-hidden
              />
              <OrnStar className="absolute -top-3 -left-4 h-4 w-4 sm:h-5 sm:w-5" />
            </span>
            <br />
            از نخ تا تن‌پوش، با عشق
          </h1>
          <p
            className={cn(
              "animate-hero-in mx-auto mt-6 max-w-xl delay-300 sm:mt-7 lg:mx-0",
              "text-navy/70 text-[15px] leading-7 sm:text-lg sm:leading-8",
              "dark:text-khaki",
            )}
          >
            ملی‌کیدز؛ بوتیک تخصصی پوشاک کودک با پارچه‌های ارگانیک، دوخت‌های دستی
            و تجربه پرو مجازی با هوش مصنوعی — برای لحظه‌هایی که قرار است در
            خاطره‌ها بمانند.
          </p>
          <div className="animate-hero-in mt-8 flex flex-col flex-wrap items-stretch justify-center gap-3 delay-500 min-[420px]:flex-row min-[420px]:items-center sm:mt-9 sm:gap-4 lg:justify-start">
            <Link
              href="/#styles"
              prefetch={false}
              className={cn(
                "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-8 py-3.5 text-sm font-black transition-all duration-500 hover:-translate-y-2 hover:scale-[1.05] sm:px-9 sm:py-4 sm:text-base",
                "from-navy via-navy-mid to-navy text-cream ring-gold/40 hover:ring-gold bg-linear-to-l shadow-[0_12px_28px_-8px_rgba(14,42,71,.45)] ring-2 hover:shadow-[0_18px_40px_-10px_rgba(193,147,87,.6)]",
              )}
            >
              <span
                className={cn(
                  "pointer-events-none absolute -inset-2 animate-pulse rounded-full opacity-70 blur-md",
                  "bg-gold/25",
                )}
                aria-hidden
              />
              <span
                className={cn(
                  "animate-shimmer pointer-events-none absolute inset-0",
                  "bg-[linear-gradient(110deg,transparent_20%,rgba(232,197,122,.55)_48%,transparent_76%)]",
                )}
                aria-hidden
              />
              <Sparkles className="animate-twinkle text-gold relative h-4 w-4" />
              <span className="relative tracking-wide">مشاهده کالکشن</span>
              <ArrowLeft className="relative h-5 w-5 transition-transform duration-500 group-hover:-translate-x-2" />
            </Link>
            <Link
              href="/tryon"
              prefetch={false}
              className={cn(
                "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border-2 px-8 py-3 text-sm font-black transition-all duration-500 hover:-translate-y-2 hover:scale-[1.05] sm:px-9 sm:py-3.75 sm:text-base",
                "border-gold bg-gold text-navy-deep hover:bg-gold-light shadow-[0_0_28px_rgba(193,147,87,.45)] hover:shadow-[0_18px_40px_-10px_rgba(193,147,87,.7)]",
              )}
            >
              <span
                className={cn(
                  "pointer-events-none absolute -inset-1 animate-ping rounded-full border opacity-40",
                  "border-gold",
                )}
                aria-hidden
              />
              <span
                className={cn(
                  "animate-shimmer pointer-events-none absolute inset-0",
                  "bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,.65)_50%,transparent_76%)]",
                )}
                aria-hidden
              />
              <Sparkles className="animate-orn-spin relative h-5 w-5" />
              <span className="relative tracking-wide">پرو مجازی با AI</span>
            </Link>
          </div>
          <div className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-2 min-[420px]:gap-6 sm:mt-12 sm:gap-10 lg:mx-0 lg:flex lg:max-w-none lg:items-center lg:justify-start">
            <div className="animate-hero-in min-w-0 text-center delay-200 lg:text-right">
              <div className={STAT_VALUE}>+۱۲٬۰۰۰</div>
              <div className={STAT_LABEL}>مادر خوشحال</div>
            </div>
            <div className="animate-hero-in min-w-0 text-center delay-300 lg:text-right">
              <div className={STAT_VALUE}>+۳۵۰</div>
              <div className={STAT_LABEL}>مدل اختصاصی</div>
            </div>
            <div className="animate-hero-in min-w-0 text-center lg:text-right">
              <div
                className={cn(
                  "flex items-center justify-center gap-1 lg:justify-start",
                  STAT_VALUE,
                )}
              >
                ۴٫۹
                <Star className="fill-gold text-gold h-3.5 w-3.5 shrink-0 sm:h-5 sm:w-5" />
              </div>
              <div className={STAT_LABEL}>امتیاز خرید</div>
            </div>
          </div>
        </div>
        <div className="group/hero animate-hero-in xs:max-w-[20rem] xs:px-4 relative mx-auto w-full max-w-[18rem] px-2 delay-200 sm:max-w-110 sm:px-0">
          <div
            className={cn(
              "relative aspect-3/4 overflow-hidden rounded-t-[999px] rounded-b-4xl border-8 sm:rounded-b-[40px] sm:border-10",
              "bg-sand shadow-navy/20 border-white shadow-2xl",
              "dark:border-linen",
            )}
          >
            <Image
              src={heroDress}
              alt="پیراهن مجلسی دخترانه ملی‌کیدز"
              width={900}
              height={1200}
              priority
              placeholder="blur"
              sizes="(max-width: 639px) 18rem, (max-width: 1023px) 27.5rem, 45vw"
              className="animate-hero-ken h-full w-full origin-[58%_38%] object-cover"
            />
            <div
              className={cn(
                "animate-shimmer pointer-events-none absolute inset-0",
                "bg-[linear-gradient(115deg,transparent_32%,rgba(255,255,255,.38)_48%,transparent_62%)]",
              )}
              aria-hidden
            />
            <div className="from-navy/25 absolute inset-0 bg-linear-to-t via-transparent to-transparent" />
          </div>
          <div
            className={cn(
              "animate-orn-sway absolute -inset-3 -z-10 rounded-t-[999px] rounded-b-[40px] border-2 border-dashed sm:-inset-5 sm:rounded-b-[48px]",
              "border-gold/50",
            )}
          />
          <div
            className={cn(
              "animate-floaty absolute top-14 -right-1 flex max-w-50 items-center gap-2 rounded-xl p-2.5 shadow-xl min-[420px]:-right-4 sm:top-16 sm:-right-10 sm:max-w-57.5 sm:gap-3 sm:rounded-2xl sm:p-3.5",
              "shadow-navy/15 bg-white",
            )}
          >
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12",
                "bg-gold/15 text-gold",
              )}
            >
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0 text-right">
              <p className="text-navy text-[10px] font-black sm:text-xs">
                پارچه ضدحساسیت
              </p>
              <p className="text-navy/70 mt-0.5 text-[10px] leading-4 sm:text-[11px]">
                گواهی OEKO-TEX برای پوست کودک
              </p>
            </div>
          </div>
          <div
            className={cn(
              "animate-floaty-slow absolute bottom-20 -left-1 rounded-xl px-3.5 py-2.5 shadow-xl min-[420px]:-left-3 sm:bottom-24 sm:-left-8 sm:rounded-2xl sm:px-5 sm:py-4",
              "bg-navy text-cream shadow-navy/30",
            )}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Scissors className="text-gold h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs font-bold sm:text-sm">دوخت اختصاصی</span>
            </div>
            <p className="text-cream/60 mt-1 hidden text-[10px] min-[420px]:block sm:text-[11px]">
              متناسب با سایز فرزند شما
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

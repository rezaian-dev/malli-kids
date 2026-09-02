"use client";

import Image from "next/image";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useRef, useState } from "react";
import { BadgeCheck, Quote, Star, ThumbsUp } from "lucide-react";
import { SliderArrow } from "@/components/ui/slider-arrow";
import { cn } from "@/lib/utils";

const REVIEWS = [
  {
    featured: true,
    name: "سارا محمدی",
    initial: "س",
    product: "پیراهن مجلسی الماسِ طلایی",
    date: "۳ مرداد ۱۴۰۵",
    rate: 5,
    img: "/brand/look-party.jpg",
    text: "برای جشن تولد دخترم سفارشش دادم؛ کیفیت دوخت و پارچه از عکس‌ها هم بهتر بود. پرو مجازی دقیقاً همان سایزی را پیشنهاد داد که تنش شد.",
    helpful: 148,
  },
  {
    name: "نگار احمدی",
    initial: "ن",
    product: "ست سیسمونی مریم (۷ تکه)",
    date: "۲۷ تیر ۱۴۰۵",
    rate: 5,
    img: "/brand/cat-baby-portrait.jpg",
    text: "هر هفت تکه‌اش را برای نوزادی‌ام گرفتم؛ پارچه فوق‌العاده لطیف است و بعد از چند بار شست‌وشو هم رنگش نرفت.",
    helpful: 96,
  },
  {
    name: "مریم رضایی",
    initial: "م",
    product: "ژاکت بافت رُز · دستدوز",
    date: "۱۸ تیر ۱۴۰۵",
    rate: 4,
    img: "/brand/look-knit-portrait.jpg",
    text: "قلاب‌بافی‌اش واقعاً دست‌دوز است و تک‌نسخه بودنش برایم ارزشمند بود؛ همه سراغش را می‌گیرند.",
    helpful: 57,
  },
  {
    name: "آرش توکلی",
    initial: "آ",
    product: "ست پیراهن و بند شلوار کلاسیک",
    date: "۱۲ تیر ۱۴۰۵",
    rate: 5,
    img: "/brand/cat-boy-portrait.jpg",
    text: "برای پسرم که همیشه از لباس‌های سفت فرار می‌کرد عالی بود؛ الگویش آزاد است و دوختش تمیز.",
    helpful: 41,
  },
  {
    name: "لیلا حسینی",
    initial: "ل",
    product: "پالتو پاییزه مخمل",
    date: "۵ تیر ۱۴۰۵",
    rate: 5,
    img: "/brand/look-party.jpg",
    text: "گرم است ولی سنگین نیست. آستر نرم و دکمه‌ها محکم دوخته شده‌اند. سایز راهنما دقیق بود.",
    helpful: 33,
  },
];

function Stars({ n }: { n: number }) {
  return (
    <div className="flex shrink-0 gap-0.5" role="img" aria-label={`${n} از ۵`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i < n ? "fill-gold text-gold" : "text-ivory/25",
          )}
        />
      ))}
    </div>
  );
}

export function HomeQuotes() {
  const autoplay = useRef(
    Autoplay({ delay: 5600, stopOnInteraction: false, stopOnMouseEnter: true }),
  );
  const [emblaRef, embla] = useEmblaCarousel(
    { loop: true, align: "center", direction: "rtl", containScroll: false },
    [autoplay.current],
  );
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const onSelect = useCallback(() => {
    if (!embla) return;
    setI(embla.selectedScrollSnap());
    setN(embla.scrollSnapList().length);
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    onSelect();
    embla.on("select", onSelect);
    embla.on("reInit", onSelect);
  }, [embla, onSelect]);

  return (
    <div className="relative min-w-0">
      <div className="overflow-hidden" ref={emblaRef} dir="rtl">
        <div className="flex items-stretch">
          {REVIEWS.map((r, idx) => {
            const on = idx === i;
            const thanks = liked[r.name];
            const count = r.helpful + (thanks ? 1 : 0);
            return (
              <div
                key={r.name}
                className="box-border flex min-w-0 shrink-0 basis-[min(100%,22rem)] px-1.5 sm:basis-[78%] sm:px-2.5 lg:basis-[62%]"
              >
                <article
                  className={cn(
                    "relative flex h-full w-full flex-col overflow-hidden rounded-[22px] p-4 shadow-lg transition-opacity duration-500 sm:rounded-[28px] sm:p-6",
                    "bg-navy text-ivory",
                    on ? "opacity-100" : "opacity-55",
                    "dark:bg-dusk-deep dark:ring-gold/30 dark:ring-1",
                  )}
                >
                  <Quote
                    className="text-gold/15 pointer-events-none absolute inset-e-3 top-3 size-12 sm:size-16"
                    strokeWidth={1.15}
                  />
                  <div className="relative flex min-h-0 flex-1 flex-col gap-4 sm:flex-row">
                    <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-2xl sm:h-auto sm:w-28">
                      {}
                      <Image
                        src={r.img}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 7rem, 100vw"
                        className="object-cover"
                      />
                      <div className="from-navy/55 absolute inset-0 bg-linear-to-t to-transparent" />
                    </div>
                    <div className="relative flex min-w-0 flex-1 flex-col">
                      <div className="mb-2 flex flex-wrap items-center gap-1.5">
                        {r.featured ? (
                          <span className="bg-gold text-navy-deep rounded-full px-2 py-0.5 text-[10px] font-black">
                            نظر منتخب
                          </span>
                        ) : null}
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold",
                            "text-gold-glow border-white/15 bg-white/10",
                          )}
                        >
                          <BadgeCheck className="size-3.5" /> تأییدشده
                        </span>
                        <Stars n={r.rate} />
                      </div>
                      <p className="text-ivory line-clamp-3 min-h-18 text-sm leading-6 font-medium sm:min-h-21 sm:leading-7">
                        «{r.text}»
                      </p>
                      <div
                        className={cn(
                          "mt-auto flex flex-col gap-3 border-t pt-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between",
                          "border-white/10",
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span
                            className={cn(
                              "flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-black",
                              "bg-gold text-navy-deep",
                            )}
                          >
                            {r.initial}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-white">
                              {r.name}
                            </p>
                            <p className="text-wheat mt-0.5 truncate text-[11px]">
                              {r.product}
                            </p>
                            <p className="text-taupe mt-0.5 text-[10px]">
                              {r.date}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setLiked((s) => ({ ...s, [r.name]: !s[r.name] }))
                          }
                          className={cn(
                            "inline-flex min-h-9 w-max shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-bold transition-all duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-95",
                            thanks
                              ? "border-gold bg-gold text-navy-deep motion-safe:hover:shadow-gold/30 motion-safe:hover:shadow-md"
                              : "text-ivory border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/15",
                          )}
                        >
                          <ThumbsUp className="size-3.5" />
                          {thanks ? "مفید بود" : "مفید"} ({count})
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex max-w-full flex-wrap items-center gap-1.5">
          {Array.from({ length: n }).map((_, k) => (
            // ♿ The dot stays visually tiny; the button underneath still
            // fills a full 24×24 tap target so it passes touch-target rules.
            <button
              key={k}
              type="button"
              aria-label={`نظر ${k + 1}`}
              onClick={() => embla?.scrollTo(k)}
              className="flex h-6 min-w-6 items-center justify-center rounded-full transition-transform duration-150 motion-safe:hover:scale-125 motion-safe:active:scale-90"
            >
              <span
                className={cn(
                  "rounded-full",
                  k === i
                    ? "bg-gold h-1.5 w-8"
                    : "bg-navy/20 dark:bg-gold-glow/35 h-1.5 w-2",
                )}
              />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <SliderArrow
            direction="prev"
            label="نظر قبلی"
            onClick={() => embla?.scrollPrev()}
          />
          <SliderArrow
            direction="next"
            label="نظر بعدی"
            onClick={() => embla?.scrollNext()}
          />
        </div>
      </div>
    </div>
  );
}

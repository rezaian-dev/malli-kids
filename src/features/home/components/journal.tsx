"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const SLIDES = [
  { href: "/articles/size", img: "/brand/cat-baby.jpg", tag: "اندازه", title: "راهنمای سایز بدون اشتباه", excerpt: "قد و دور سینه را چطور بگیرید تا لباس برنگردد." },
  { href: "/articles/fabric", img: "/brand/look-knit.jpg", tag: "مراقبت", title: "پارچه مناسب پوست حساس", excerpt: "پنبه ارگانیک، شست‌وشو و اتوی بی‌خطر برای نوزاد." },
  { href: "/articles/party", img: "/brand/look-party.jpg", tag: "استایل", title: "استایل جشن تولد دخترانه", excerpt: "پیراهن مجلسی را با تل و کفش چطور ست کنید." },
  { href: "/articles/size", img: "/brand/cat-girl.jpg", tag: "راهنما", title: "بین دو سایز کدام را بردارید؟", excerpt: "برای پالتو و لباس رویی معمولاً سایز بزرگ‌تر راحت‌تر است." },
  { href: "/articles/fabric", img: "/brand/cat-boy.jpg", tag: "دوخت", title: "چرا الگوی آزاد برای بازی مهم است", excerpt: "درز آزاد یعنی کودک می‌دود و لباس کش نمی‌آید." },
];

export function Journal() {
  const [emblaRef, embla] = useEmblaCarousel(
    { loop: true, align: "start", direction: "rtl", skipSnaps: false, dragFree: false },
    [Autoplay({ delay: 4500, stopOnInteraction: false, stopOnMouseEnter: true })],
  );
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);

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
    <div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {SLIDES.map((s) => (
            <div className="min-w-0 shrink-0 basis-[86%] sm:basis-1/2 lg:basis-1/3 pe-5 box-border" key={s.title}>
              <a href={s.href} className="group block h-full overflow-hidden rounded-3xl border border-navy/10 bg-white/92 no-underline shadow-[0_14px_32px_-22px_rgba(14,42,71,.25)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/45 hover:shadow-[0_20px_40px_-20px_rgba(193,147,87,.28)] dark:border-gold/30 dark:bg-slate/55">
                <div className="aspect-16/10 overflow-hidden bg-sand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.img} alt="" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <span className="text-[10px] font-black text-gold tracking-widest">{s.tag}</span>
                  <h3 className="mt-1.5 mb-0 font-black text-navy dark:text-linen text-[0.98rem] leading-snug">{s.title}</h3>
                  <p className="mt-1.5 mb-0 text-xs text-navy/50 dark:text-khaki leading-7">{s.excerpt}</p>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {Array.from({ length: n }).map((_, k) => (
            <button
              key={k}
              type="button"
              aria-label={`اسلاید ${k + 1}`}
              onClick={() => embla?.scrollTo(k)}
              className={`h-2 rounded-full transition-all ${k === i ? "w-7 bg-gold" : "w-2 bg-navy/20 dark:bg-gold-soft/40 hover:bg-navy/35"}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" className="size-10 rounded-full border-[1.5px] border-navy/10 dark:border-gold/40 bg-white dark:bg-dusk-mid text-navy dark:text-linen inline-flex items-center justify-center hover:bg-gold hover:text-navy-deep hover:border-gold" aria-label="قبلی" onClick={() => embla?.scrollPrev()}>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button type="button" className="size-10 rounded-full border-[1.5px] border-navy/10 dark:border-gold/40 bg-white dark:bg-dusk-mid text-navy dark:text-linen inline-flex items-center justify-center hover:bg-gold hover:text-navy-deep hover:border-gold" aria-label="بعدی" onClick={() => embla?.scrollNext()}>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

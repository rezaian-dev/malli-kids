"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useRef, useState } from "react";
import { BadgeCheck, Quote, Star } from "lucide-react";
import { SliderArrow } from "@/components/ui/slider-arrow";
import { cn } from "@/lib/utils";
import type { AdminReview } from "@/types";

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

export function HomeQuotes({ reviews }: { reviews: AdminReview[] }) {
  const autoplay = useRef(
    Autoplay({ delay: 5600, stopOnInteraction: false, stopOnMouseEnter: true }),
  );
  const [emblaRef, embla] = useEmblaCarousel(
    { loop: true, align: "center", direction: "rtl", containScroll: false },
    [autoplay.current],
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
    <div className="relative min-w-0">
      <div className="overflow-hidden" ref={emblaRef} dir="rtl">
        <div className="flex items-stretch">
          {reviews.map((r, idx) => {
            const on = idx === i;
            return (
              <div
                key={r.id}
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
                  <div className="relative flex min-h-0 flex-1 flex-col">
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
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
                        "mt-auto flex items-center gap-2.5 border-t pt-3",
                        "border-white/10",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-black",
                          "bg-gold text-navy-deep",
                        )}
                      >
                        {r.author.trim().charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-white">
                          {r.author}
                        </p>
                        <p className="text-wheat mt-0.5 truncate text-[11px]">
                          {r.product}
                        </p>
                        <p className="text-taupe mt-0.5 text-[10px]">
                          {r.date}
                        </p>
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

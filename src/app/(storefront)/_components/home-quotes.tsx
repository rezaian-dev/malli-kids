"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
} from "react";
import { useReducedMotion } from "motion/react";
import { BadgeCheck, Pause, Play, Quote, Star } from "lucide-react";
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
            i < n ? "fill-gold-light text-gold-light" : "text-ivory/25",
          )}
        />
      ))}
    </div>
  );
}

export function HomeQuotes({ reviews }: { reviews: AdminReview[] }) {
  // All plugin-side automation is OFF — rotation is driven by React state below
  // so hover, the focus latch, and reduced motion compose deterministically.
  const autoplay = useRef(
    Autoplay({
      delay: 5600,
      playOnInit: false,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
      stopOnFocusIn: false,
    }),
  );
  const [emblaRef, embla] = useEmblaCarousel(
    { loop: true, align: "center", direction: "rtl", containScroll: false },
    [autoplay.current],
  );
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  // Latched when focus enters the carousel (APG: rotation must not resume
  // without an explicit play action); cleared only by the rotation toggle.
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;
  const toggleRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (!embla) return;
    if (paused || hover || reduceMotion) autoplay.current.stop();
    else autoplay.current.play();
  }, [embla, paused, hover, reduceMotion]);

  function onFocusCapture(event: FocusEvent<HTMLDivElement>) {
    // The toggle itself must not latch — focusing it to press play would
    // otherwise re-pause rotation immediately.
    if (toggleRef.current?.contains(event.target as Node)) return;
    setPaused(true);
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="نظرهای مشتریان"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocusCapture={onFocusCapture}
      className="relative flex min-w-0 flex-col"
    >
      {/* Controls precede the slides in DOM order so the rotation toggle is
          first in the Tab sequence (APG); `order-*` preserves the layout. */}
      <div className="order-2 mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex max-w-full flex-wrap items-center gap-1.5">
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            aria-label={paused ? "شروع چرخش خودکار" : "توقف چرخش خودکار"}
            className="group inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-navy/10 bg-white/90 text-navy backdrop-blur transition-all duration-300 hover:scale-105 hover:border-gold/50 hover:text-gold-deep dark:border-gold/25 dark:bg-white/5 dark:text-ivory dark:hover:border-gold/60 dark:hover:text-gold-light"
          >
            {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
          </button>
          {Array.from({ length: n }).map((_, k) => (
            // Tiny dot, full 24×24 tap target underneath
            <button
              key={k}
              type="button"
              aria-label={`نظر ${k + 1}`}
              aria-current={k === i || undefined}
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

      <div className="order-1 overflow-hidden" ref={emblaRef} dir="rtl">
        <div className="flex items-stretch">
          {reviews.map((r, idx) => {
            const on = idx === i;
            return (
              <div
                key={r.id}
                className="box-border flex min-w-0 shrink-0 basis-[min(100%,22rem)] px-1.5 sm:basis-[78%] sm:px-2.5 lg:basis-[62%]"
              >
                <article
                  aria-roledescription="slide"
                  aria-label={`نظر ${idx + 1} از ${reviews.length}`}
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
                        className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold text-gold-glow border-white/15 bg-white/10"
                      >
                        <BadgeCheck className="size-3.5" /> تأییدشده
                      </span>
                      <Stars n={r.rate} />
                    </div>
                    <p className="text-ivory line-clamp-3 min-h-18 text-sm leading-6 font-medium sm:min-h-21 sm:leading-7">
                      «{r.text}»
                    </p>
                    <div
                      className="mt-auto flex items-center gap-2.5 border-t pt-3 border-white/10"
                    >
                      <span
                        className="flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-black bg-gold text-navy-deep"
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
    </div>
  );
}

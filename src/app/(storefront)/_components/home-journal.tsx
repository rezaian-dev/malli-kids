"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";
import { Pause, Play } from "lucide-react";
import { SliderArrow } from "@/components/ui/slider-arrow";
import { cn } from "@/lib/utils";

export function HomeJournal({ children }: { children: ReactNode }) {
  // All plugin-side automation is OFF — rotation is driven by React state below
  // so hover, the focus latch, and reduced motion compose deterministically.
  const autoplay = useRef(
    Autoplay({
      delay: 4500,
      playOnInit: false,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
      stopOnFocusIn: false,
    }),
  );
  const [emblaRef, embla] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      direction: "rtl",
      skipSnaps: false,
      dragFree: false,
    },
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
      aria-label="مجله ملی‌کیدز"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocusCapture={onFocusCapture}
      className="flex min-w-0 flex-col"
    >
      {/* Controls precede the slides in DOM order so the rotation toggle is
          first in the Tab sequence (APG); `order-*` preserves the layout. */}
      <div className="order-2 mt-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
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
            <button
              key={k}
              type="button"
              aria-label={`اسلاید ${k + 1}`}
              aria-current={k === i || undefined}
              onClick={() => embla?.scrollTo(k)}
              className="group flex h-6 min-w-6 items-center justify-center rounded-full transition-transform duration-150 motion-safe:hover:scale-125 motion-safe:active:scale-90"
            >
              <span
                className={cn(
                  "h-2 rounded-full transition-all",
                  k === i
                    ? "bg-gold w-7"
                    : "bg-navy/20 dark:bg-gold-soft/40 group-hover:bg-navy/35 w-2",
                )}
              />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <SliderArrow
            direction="prev"
            label="قبلی"
            onClick={() => embla?.scrollPrev()}
          />
          <SliderArrow
            direction="next"
            label="بعدی"
            onClick={() => embla?.scrollNext()}
          />
        </div>
      </div>
      <div className="order-1 overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">{children}</div>
      </div>
    </div>
  );
}

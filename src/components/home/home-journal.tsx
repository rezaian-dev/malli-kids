"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { SliderArrow } from "@/components/ui/slider-arrow";

export function HomeJournal({ children }: { children: ReactNode }) {
  const [emblaRef, embla] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      direction: "rtl",
      skipSnaps: false,
      dragFree: false,
    },
    [
      Autoplay({
        delay: 4500,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ],
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
        <div className="flex touch-pan-y">{children}</div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {Array.from({ length: n }).map((_, k) => (
            <button
              key={k}
              type="button"
              aria-label={`اسلاید ${k + 1}`}
              onClick={() => embla?.scrollTo(k)}
              className={`h-2 rounded-full transition-all ${k === i ? "bg-gold w-7" : "bg-navy/20 dark:bg-gold-soft/40 hover:bg-navy/35 w-2"}`}
            />
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
    </div>
  );
}

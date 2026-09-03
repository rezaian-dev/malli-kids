"use client";

import Image from "next/image";
import { useState } from "react";
import { SliderArrow } from "@/components/ui/slider-arrow";
import { cn } from "@/lib/utils";
import { pdpCard } from "../_lib/product-chrome";

const CORNER_MARK =
  "border-gold/70 pointer-events-none absolute z-10 hidden h-6 w-6 min-[400px]:block sm:h-8 sm:w-8";

/** 🖼️ The swipeable product image carousel + thumbnail strip. */
export function ProductGallery({
  images,
  name,
  disc,
  badge,
}: {
  images: string[];
  name: string;
  disc?: string;
  badge?: string;
}) {
  const [slide, setSlide] = useState(0);
  const go = (n: number) => setSlide((n + images.length) % images.length);

  return (
    <div className="min-w-0 lg:sticky lg:top-24">
      <div
        className={cn(
          "relative aspect-4/5 overflow-hidden rounded-[22px] shadow-[0_28px_60px_-32px_rgba(14,42,71,.42)] select-none sm:rounded-[36px]",
          "border-navy/10 bg-sand/55 ring-gold/35 border ring-1",
          "dark:border-gold/30 dark:bg-dusk",
        )}
        onTouchStart={(e) => {
          e.currentTarget.dataset.x = String(e.changedTouches[0].clientX);
        }}
        onTouchEnd={(e) => {
          const start = Number(e.currentTarget.dataset.x || 0);
          const dx = e.changedTouches[0].clientX - start;
          if (Math.abs(dx) > 40) go(slide + (dx > 0 ? -1 : 1));
        }}
      >
        <span
          className={cn(
            CORNER_MARK,
            "top-3 right-3 rounded-tr-lg border-t-2 border-r-2 sm:top-5 sm:right-5",
          )}
        />
        <span
          className={cn(
            CORNER_MARK,
            "top-3 left-3 rounded-tl-lg border-t-2 border-l-2 sm:top-5 sm:left-5",
          )}
        />
        <span
          className={cn(
            CORNER_MARK,
            "right-3 bottom-3 rounded-br-lg border-r-2 border-b-2 sm:right-5 sm:bottom-5",
          )}
        />
        <span
          className={cn(
            CORNER_MARK,
            "bottom-3 left-3 rounded-bl-lg border-b-2 border-l-2 sm:bottom-5 sm:left-5",
          )}
        />
        <div
          className="absolute inset-0 flex h-full transition-transform duration-500"
          style={{ transform: `translateX(${-slide * 100}%)` }}
        >
          {images.map((src, index) => (
            <Image
              key={src}
              src={src}
              alt={name}
              width={900}
              height={1200}
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
              sizes="(max-width: 1023px) 100vw, 44vw"
              className="h-full w-full shrink-0 object-cover"
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex justify-between min-[400px]:inset-x-12 min-[400px]:top-5 sm:inset-x-14">
          {disc ? (
            <span
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] font-black",
                "bg-rose text-white",
              )}
            >
              {disc} تخفیف
            </span>
          ) : (
            <span />
          )}
          {badge ? (
            <span
              className={cn(
                "ms-auto rounded-full px-3 py-1.5 text-[11px] font-black",
                badge === "جدید" ? "bg-gold text-navy-deep" : "bg-navy text-gold-light",
              )}
            >
              {badge}
            </span>
          ) : null}
        </div>
        <SliderArrow
          chevron
          direction="prev"
          label="قبلی"
          onClick={() => go(slide - 1)}
          className="absolute inset-s-3 top-1/2 z-10 -translate-y-1/2"
        />
        <SliderArrow
          chevron
          direction="next"
          label="بعدی"
          onClick={() => go(slide + 1)}
          className="absolute inset-e-3 top-1/2 z-10 -translate-y-1/2"
        />
        <div className="absolute inset-x-0 bottom-7 z-10 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`اسلاید ${i + 1}`}
              onClick={() => go(i)}
              className="flex h-6 min-w-6 items-center justify-center rounded-full transition-transform duration-150 motion-safe:hover:scale-125 motion-safe:active:scale-90"
            >
              <span
                className={cn(
                  "h-2 rounded-full transition-[width,background-color] duration-300",
                  i === slide ? "bg-gold w-6" : "w-2 bg-white/70",
                )}
              />
            </button>
          ))}
        </div>
      </div>
      <div className={`${pdpCard} mt-3 p-2`}>
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => go(i)}
              aria-label={`تصویر ${i + 1} ${name}`}
              aria-current={i === slide || undefined}
              className={cn(
                "size-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 motion-safe:hover:-translate-y-0.5 sm:size-18 sm:rounded-2xl",
                i === slide
                  ? "border-gold ring-gold/30 ring-2"
                  : "border-navy/10 dark:border-gold/20 opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={src}
                alt=""
                width={96}
                height={96}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

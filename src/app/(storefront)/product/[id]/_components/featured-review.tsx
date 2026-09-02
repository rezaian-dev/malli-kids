"use client";

import { useState } from "react";
import { BadgeCheck, Quote, ThumbsUp } from "lucide-react";
import { toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminReview } from "@/types";
import { ReviewStars } from "./review-stars";

/** 🏅 The pinned "featured" review with a helpful-vote toggle. */
export function FeaturedReview({ review }: { review: AdminReview }) {
  const [thanks, setThanks] = useState(false);

  return (
    <article
      className={cn(
        "relative min-w-0 overflow-hidden rounded-[22px] p-4 shadow-[0_22px_44px_-28px_rgba(14,42,71,.45)] sm:rounded-[28px] sm:p-6",
        "bg-navy text-ivory",
        "dark:bg-dusk-deep dark:ring-gold/30 dark:ring-1",
      )}
    >
      <Quote
        className="text-gold/20 pointer-events-none absolute top-3 left-3 size-12 sm:size-16"
        strokeWidth={1.15}
      />
      <div className="relative flex flex-wrap items-center gap-1.5">
        <span className="bg-gold text-navy-deep rounded-full px-2.5 py-0.5 text-[10px] font-black">
          نظر منتخب
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold",
            "text-gold-light border-white/15 bg-white/10",
          )}
        >
          <BadgeCheck className="size-3.5" /> خرید تأییدشده
        </span>
        <ReviewStars n={review.rate} />
      </div>
      <p className="text-ivory mt-4 text-sm leading-7 font-medium sm:text-[15px]">
        «{review.text}»
      </p>
      <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-xl text-sm font-black",
              "bg-gold text-navy-deep",
            )}
          >
            س
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">
              {review.author}
            </p>
            <time className="text-wheat mt-0.5 block text-[11px] font-bold no-underline">
              {review.date}
            </time>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setThanks((v) => !v)}
          className={cn(
            "inline-flex min-h-9 w-max shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-bold transition-all duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-95",
            thanks
              ? "border-gold bg-gold text-navy-deep motion-safe:hover:shadow-gold/30 motion-safe:hover:shadow-md"
              : "text-ivory border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/15",
          )}
        >
          <ThumbsUp className="size-3.5" />
          {thanks ? "مفید بود" : "مفید"} ({toFaDigits(thanks ? 43 : 42)})
        </button>
      </div>
    </article>
  );
}

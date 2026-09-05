import { BadgeCheck, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AdminReview } from "@/types";
import { ReviewStars } from "./review-stars";

/** 🏅 The pinned "featured" (most recent) real review. */
export function FeaturedReview({ review }: { review: AdminReview }) {
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
        <Badge className="bg-gold text-navy-deep rounded-full border-0 px-2.5 py-0.5 text-[10px] font-black">
          نظر منتخب
        </Badge>
        <Badge
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-bold",
            "text-gold-light border-white/15 bg-white/10",
          )}
        >
          <BadgeCheck className="size-3.5" /> خرید تأییدشده
        </Badge>
        <ReviewStars n={review.rate} />
      </div>
      <p className="text-ivory mt-4 text-sm leading-7 font-medium sm:text-[15px]">
        «{review.text}»
      </p>
      <div className="mt-5 flex min-w-0 items-center gap-2.5 border-t border-white/10 pt-4">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl text-sm font-black",
            "bg-gold text-navy-deep",
          )}
        >
          {review.author.trim().charAt(0)}
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
    </article>
  );
}

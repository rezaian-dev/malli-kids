import { cn } from "@/lib/utils";
import type { AdminReview } from "@/types";
import { ReviewStars } from "./review-stars";

/** 💬 One regular (non-featured) buyer review. */
export function BuyerReviewCard({ review }: { review: AdminReview }) {
  return (
    <article
      className={cn(
        "min-w-0 rounded-[22px] p-4 shadow-[0_16px_36px_-26px_rgba(14,42,71,.28)] sm:rounded-3xl sm:p-5",
        "border-navy/8 border bg-white/90",
        "dark:border-gold/30 dark:bg-slate",
      )}
    >
      <div className="flex flex-col gap-2 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-full text-sm font-black",
              "bg-gold/15 text-gold",
            )}
          >
            {review.author.trim().charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="text-navy dark:text-ivory truncate text-sm font-black">
              {review.author}
            </p>
            <ReviewStars n={review.rate} />
          </div>
        </div>
        <time
          className={cn(
            "shrink-0 text-[11px] font-bold no-underline",
            "text-navy/70",
            "dark:text-wheat",
          )}
        >
          تاریخ نظر: {review.date}
        </time>
      </div>
      <p className="text-navy/70 dark:text-wheat mt-3 text-sm leading-7">
        «{review.text}»
      </p>
    </article>
  );
}

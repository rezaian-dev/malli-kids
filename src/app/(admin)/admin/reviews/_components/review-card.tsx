import { Check, CircleAlert, EyeOff, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toFaDigits } from "@/lib/locale/fa";
import { adminGlassCard } from "@/lib/admin/admin-chrome";
import type { AdminReview } from "@/types";

const ACTION_BUTTON_BASE =
  "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-[10px] font-black transition hover:-translate-y-0.5";

/** ⭐ One customer review — publish/unpublish and delete. */
export function ReviewCard({
  review,
  onToggleVisible,
  onRemove,
}: {
  review: AdminReview;
  onToggleVisible: () => void;
  onRemove: () => void;
}) {
  return (
    <article
      className={cn(
        adminGlassCard,
        !review.visible && "border-amber-400/22 dark:border-amber-300/20",
      )}
    >
      {!review.visible ? (
        <span className="absolute inset-y-0 inset-s-0 w-1 bg-amber-400" />
      ) : (
        <span className="absolute inset-y-0 inset-s-0 w-1 bg-emerald-500/70" />
      )}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-black",
                  review.visible
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "bg-amber-500/12 text-amber-700 dark:text-amber-300",
                )}
              >
                {review.visible ? (
                  <>
                    <Check className="size-3" /> منتشرشده
                  </>
                ) : (
                  <>
                    <CircleAlert className="size-3" /> در انتظار تأیید
                  </>
                )}
              </span>
              <span className="text-gold-deep dark:text-gold-soft truncate text-[10px] font-black">
                {review.product}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-xl text-xs font-black",
                  "bg-navy text-gold",
                  "dark:bg-gold/15 dark:text-gold-soft",
                )}
              >
                {review.author.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="text-navy dark:text-ivory truncate text-sm font-black">
                  {review.author}
                </p>
                <div
                  className="mt-0.5 flex items-center gap-0.5"
                  aria-label={`${review.rate} از ۵ ستاره`}
                >
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star
                      key={starIndex}
                      className={cn(
                        "size-3.5",
                        starIndex < review.rate
                          ? "fill-gold text-gold"
                          : "text-khaki/70 fill-transparent",
                      )}
                    />
                  ))}
                  <span className="text-navy/45 dark:text-wheat ms-1.5 text-[9px] font-black">
                    {toFaDigits(review.rate)} از ۵
                  </span>
                </div>
              </div>
            </div>

            <blockquote
              className={cn(
                "mt-3 rounded-2xl px-4 py-3 text-xs leading-7",
                "bg-navy/[0.035] text-navy/78",
                "dark:text-ivory/78 dark:bg-white/[0.035]",
              )}
            >
              “{review.text}”
            </blockquote>
            <p className="text-navy/35 dark:text-wheat/55 mt-2 text-[9px] font-bold">
              ثبت‌شده در {review.date}
            </p>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-2 lg:w-36 lg:grid-cols-1">
            <button
              type="button"
              onClick={onToggleVisible}
              className={cn(
                ACTION_BUTTON_BASE,
                review.visible
                  ? "border-navy/10 text-navy/65 hover:border-gold dark:border-gold/18 dark:text-wheat border"
                  : "bg-emerald-500 text-white shadow-[0_10px_24px_-15px_rgba(16,185,129,.8)] hover:bg-emerald-600",
              )}
            >
              {review.visible ? (
                <>
                  <EyeOff className="size-3.5" /> لغو انتشار
                </>
              ) : (
                <>
                  <Check className="size-3.5" /> تأیید و انتشار
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onRemove}
              className={cn(
                ACTION_BUTTON_BASE,
                "bg-rose/9 text-rose hover:bg-rose/14",
              )}
            >
              <Trash2 className="size-3.5" /> حذف نظر
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

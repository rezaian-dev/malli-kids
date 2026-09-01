"use client";

import { useMemo, useState } from "react";
import {
  Check,
  CircleAlert,
  Eye,
  EyeOff,
  MessageSquareText,
  Star,
  Trash2,
} from "lucide-react";

import { Pagination } from "@/components/ui/pagination";
import {
  AdminFilterBar,
  AdminFilterSelect,
  AdminStatStrip,
  AdminPageHeader,
  useAdmin,
} from "@/components/admin";
import { usePagination } from "@/hooks/use-pagination";
import { toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import { adminGlassCard } from "@/lib/admin/admin-chrome";

const PER_PAGE = 6;
type VisibilityFilter = "all" | "approved" | "pending";
type SortFilter = "newest" | "rating-desc" | "rating-asc";

const ACTION_BUTTON_BASE =
  "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-[10px] font-black transition hover:-translate-y-0.5";

export default function AdminReviews() {
  const { db, saveReview, removeReview } = useAdmin();
  const [q, setQ] = useState("");
  const [visibility, setVisibility] = useState<VisibilityFilter>("all");
  const [rating, setRating] = useState("all");
  const [sort, setSort] = useState<SortFilter>("newest");

  const list = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("fa");
    return db.reviews
      .filter((review) => {
        const matchesSearch =
          !term ||
          `${review.author} ${review.product} ${review.text}`
            .toLocaleLowerCase("fa")
            .includes(term);
        const matchesVisibility =
          visibility === "all" ||
          (visibility === "approved" ? review.visible : !review.visible);
        const matchesRating =
          rating === "all" || review.rate === Number(rating);
        return matchesSearch && matchesVisibility && matchesRating;
      })
      .sort((a, b) => {
        if (sort === "rating-desc") return b.rate - a.rate;
        if (sort === "rating-asc") return a.rate - b.rate;
        return b.date.localeCompare(a.date, "fa");
      });
  }, [db.reviews, q, rating, sort, visibility]);

  const pg = usePagination(
    list,
    PER_PAGE,
    `${q}|${visibility}|${rating}|${sort}`,
  );
  const approved = db.reviews.filter((review) => review.visible).length;
  const pending = db.reviews.length - approved;
  const average = db.reviews.length
    ? (
        db.reviews.reduce((sum, review) => sum + review.rate, 0) /
        db.reviews.length
      ).toFixed(1)
    : "۰";
  const activeFilters =
    Number(!!q.trim()) +
    Number(visibility !== "all") +
    Number(rating !== "all") +
    Number(sort !== "newest");

  return (
    <div>
      <AdminPageHeader
        kicker="CUSTOMER VOICE"
        title="مدیریت نظرات"
        description="بررسی، پالایش و انتشار بازخوردهای مشتریان برای حفظ کیفیت تجربه خرید."
      />

      <AdminStatStrip
        items={[
          {
            label: "کل نظرات",
            value: db.reviews.length,
            Icon: MessageSquareText,
            tone: "blue",
          },
          {
            label: "در انتظار بررسی",
            value: pending,
            hint: pending ? "نیازمند تصمیم" : "صف بررسی خالی است",
            Icon: CircleAlert,
            tone: "rose",
          },
          { label: "منتشرشده", value: approved, Icon: Eye, tone: "emerald" },
          {
            label: "میانگین امتیاز",
            value: `${toFaDigits(average)} از ۵`,
            Icon: Star,
            tone: "gold",
          },
        ]}
      />

      <AdminFilterBar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="نام مشتری، محصول یا متن نظر…"
        resultCount={list.length}
        resultLabel="نظر"
        activeCount={activeFilters}
        onReset={() => {
          setQ("");
          setVisibility("all");
          setRating("all");
          setSort("newest");
        }}
      >
        <AdminFilterSelect
          label="وضعیت انتشار"
          value={visibility}
          onValueChange={(value) => setVisibility(value as VisibilityFilter)}
          options={[
            { value: "all", label: "همه نظرات", count: db.reviews.length },
            { value: "pending", label: "در انتظار تأیید", count: pending },
            { value: "approved", label: "تأییدشده", count: approved },
          ]}
        />
        <AdminFilterSelect
          label="امتیاز"
          value={rating}
          onValueChange={setRating}
          options={[
            { value: "all", label: "همه امتیازها" },
            ...[5, 4, 3, 2, 1].map((value) => ({
              value: String(value),
              label: `${toFaDigits(value)} ستاره`,
            })),
          ]}
        />
        <AdminFilterSelect
          label="مرتب‌سازی"
          value={sort}
          onValueChange={(value) => setSort(value as SortFilter)}
          options={[
            { value: "newest", label: "جدیدترین" },
            { value: "rating-desc", label: "بیشترین امتیاز" },
            { value: "rating-asc", label: "کمترین امتیاز" },
          ]}
        />
      </AdminFilterBar>

      {list.length > 0 ? (
        <div className="grid gap-3">
          {pg.pageItems.map((review, index) => (
            <article
              key={review.id}
              className={cn(
                adminGlassCard,
                !review.visible &&
                  "border-amber-400/22 dark:border-amber-300/20",
              )}
              style={{ animationDelay: `${index * 45}ms` }}
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
                      onClick={() =>
                        saveReview({ ...review, visible: !review.visible })
                      }
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
                      onClick={() => removeReview(review.id)}
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
          ))}
        </div>
      ) : (
        <div className={cn(adminGlassCard, "px-5 py-14 text-center")}>
          <MessageSquareText className="text-gold mx-auto size-10" />
          <p className="mt-3 text-sm font-black">نظری مطابق فیلترها پیدا نشد</p>
        </div>
      )}

      {list.length > 0 ? <Pagination pg={pg} unit="نظر" /> : null}
    </div>
  );
}

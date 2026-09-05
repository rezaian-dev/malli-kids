"use client";

import { useMemo, useState, useTransition } from "react";
import { CircleAlert, Eye, MessageSquareText, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  AdminConfirmDialog,
  AdminFilterBar,
  AdminFilterSelect,
  AdminStatStrip,
  AdminPageHeader,
} from "@/components/admin";
import { usePagination } from "@/hooks/use-pagination";
import { usePolling } from "@/hooks/use-polling";
import { toFaDigits } from "@/lib/locale/fa";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { adminGlassCard } from "@/lib/admin/admin-chrome";
import type { AdminReview } from "@/types";
import {
  bulkRemoveReviewsAction,
  bulkSetReviewsVisibleAction,
  getAllReviewsAction,
  removeReviewAction,
  setReviewVisibleAction,
} from "../_lib/actions";
import { ReviewCard } from "./review-card";

const PER_PAGE = 6;
const POLL_MS = 20_000;
type VisibilityFilter = "all" | "approved" | "pending";
type SortFilter = "newest" | "rating-desc" | "rating-asc";

export function AdminReviewsLanding({
  reviews: initialReviews,
}: {
  reviews: AdminReview[];
}) {
  const [reviews] = usePolling(getAllReviewsAction, POLL_MS, initialReviews);
  const [, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [visibility, setVisibility] = useState<VisibilityFilter>("all");
  const [rating, setRating] = useState("all");
  const [sort, setSort] = useState<SortFilter>("newest");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleSelect(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const list = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("fa");
    return reviews
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
  }, [reviews, q, rating, sort, visibility]);

  const pg = usePagination(
    list,
    PER_PAGE,
    `${q}|${visibility}|${rating}|${sort}`,
  );
  const approved = reviews.filter((review) => review.visible).length;
  const pending = reviews.length - approved;
  const average = reviews.length
    ? (
        reviews.reduce((sum, review) => sum + review.rate, 0) /
        reviews.length
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
            value: reviews.length,
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
            { value: "all", label: "همه نظرات", count: reviews.length },
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

      {selected.size > 0 ? (
        <div
          className={cn(
            "mb-4 flex flex-wrap items-center gap-2 rounded-2xl border px-4 py-3",
            "border-gold/25 bg-gold/8",
          )}
        >
          <p className="text-navy dark:text-ivory text-xs font-black">
            {toFaDigits(selected.size)} نظر انتخاب‌شده
          </p>
          <Button
            variant="outline"
            className="h-9 rounded-xl px-3 text-[11px]"
            onClick={() =>
              startTransition(async () => {
                const result = await bulkSetReviewsVisibleAction(
                  Array.from(selected),
                  true,
                );
                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }
                toast.success("نظرات منتشر شدند");
                setSelected(new Set());
              })
            }
          >
            انتشار گروهی
          </Button>
          <Button
            variant="outline"
            className="h-9 rounded-xl px-3 text-[11px]"
            onClick={() =>
              startTransition(async () => {
                const result = await bulkSetReviewsVisibleAction(
                  Array.from(selected),
                  false,
                );
                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }
                toast.success("انتشار نظرات لغو شد");
                setSelected(new Set());
              })
            }
          >
            لغو انتشار گروهی
          </Button>
          <AdminConfirmDialog
            title={`حذف ${toFaDigits(selected.size)} نظر؟`}
            description="این نظرات برای همیشه حذف می‌شوند. این عمل قابل بازگشت نیست."
            successMessage="نظرات حذف شدند"
            onConfirm={() => bulkRemoveReviewsAction(Array.from(selected))}
            trigger={
              <button
                type="button"
                className="bg-rose/10 text-rose hover:bg-rose/15 h-9 rounded-xl px-3 text-[11px] font-black transition"
              >
                حذف گروهی
              </button>
            }
          />
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-navy/70 dark:text-wheat text-[11px] font-bold underline"
          >
            لغو انتخاب
          </button>
        </div>
      ) : null}

      {list.length > 0 ? (
        <div className="grid gap-3">
          {pg.pageItems.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              selected={selected.has(review.id)}
              onToggleSelect={() => toggleSelect(review.id)}
              onToggleVisible={() =>
                startTransition(async () => {
                  const result = await setReviewVisibleAction(
                    review.id,
                    !review.visible,
                  );
                  if (!result.ok) toast.error(result.error);
                })
              }
              onRemove={() => removeReviewAction(review.id)}
            />
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

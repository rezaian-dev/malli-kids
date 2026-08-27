"use client";

import { Check, CircleDot, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAdmin } from "@/features/admin";
import { toFaDigits } from "@/lib/format";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { PageHead } from "@/features/admin";

const PER_PAGE = 5;
const SOON = () => toast("این بخش با راه‌اندازی backend فعال می‌شود");

export default function AdminReviews() {
  const { db } = useAdmin();
  const pg = usePagination(db.reviews, PER_PAGE);

  return (
    <div>
      <PageHead kicker="REVIEWS" title="نظرات محصولات" />
      <p className="mb-4 text-sm text-navy/50 dark:text-wheat">هر نظر را می‌توانید تأیید یا حذف کنید. فقط نظرات تأییدشده در صفحهٔ محصول نمایش داده می‌شوند.</p>

      <div className="grid gap-3">
        {pg.pageItems.map((r) => (
          <article key={r.id} className="admin-card p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-black text-gold">{r.product}</span>
                  {r.visible ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                      <Check className="size-3" /> تأییدشده
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/12 px-2 py-0.5 text-[10px] font-black text-amber-600 dark:text-amber-400">
                      <CircleDot className="size-3" /> در انتظار تأیید
                    </span>
                  )}
                </div>
                <p className="mt-1 font-black text-navy dark:text-ivory">{r.author}</p>
                <div className="mt-1 flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`size-3.5 ${i < r.rate ? "fill-gold text-gold" : "text-khaki"}`} />
                  ))}
                  <span className="ms-2 text-[11px] font-bold">{toFaDigits(r.rate)}</span>
                </div>
                <p className="mt-2 text-sm leading-7 text-navy/75 dark:text-ivory/80">{r.text}</p>
                <p className="mt-1 text-[11px] text-navy/40 dark:text-wheat">{r.date}</p>
              </div>

              <div className="flex shrink-0 gap-2 sm:flex-col">
                <button
                  type="button"
                  onClick={SOON}
                  disabled={r.visible}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-[12px] font-black text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                >
                  <Check className="size-4" /> {r.visible ? "تأییدشده" : "تأیید"}
                </button>
                <button
                  type="button"
                  onClick={SOON}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-rose-pale px-4 py-2 text-[12px] font-black text-rose transition hover:bg-rose/15 dark:bg-rose/15 sm:flex-none"
                >
                  <Trash2 className="size-4" /> حذف
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Pagination pg={pg} unit="نظر" />
    </div>
  );
}

"use client";

import { Ruler, Sparkles } from "lucide-react";
import type { Product } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toFaDigits } from "@/lib/locale/fa";
import { ProductSizeTable } from "./product-size-table";
import { ProductReviewForm } from "./product-review-form";
import { ProductReviews } from "./product-reviews";
import { LiveDesc } from "./product-live-context";
import { pdpCard, pdpKicker, pdpWell } from "./product-chrome";

const SPEC_ITEM = `${pdpWell} p-4`;
const SPEC_LABEL = "text-gold text-[11px] font-bold";
const SPEC_VALUE = "text-navy dark:text-ivory mt-1 text-sm font-black";

const TRIGGER = cn(
  "h-auto min-h-9 w-full rounded-full px-1 py-2 text-center text-[10px] leading-4 font-bold whitespace-normal transition-colors min-[360px]:px-2 min-[360px]:text-[11px] sm:min-h-10 sm:w-auto sm:px-5 sm:py-2.5 sm:text-sm sm:whitespace-nowrap",
  "text-navy/70 dark:text-wheat",
  "data-[state=active]:bg-navy data-[state=active]:font-black data-[state=active]:text-cream",
  "dark:data-[state=active]:bg-gold dark:data-[state=active]:text-navy-deep",
);

// 📚 Server-first product tabs with small client leaves.
export function ProductDetailsTabs({ product }: { product: Product }) {
  return (
    <section className={`${pdpCard} mt-10 overflow-hidden sm:mt-12`}>
      <Tabs defaultValue="info" dir="rtl" className="gap-0">
        <div
          className={cn(
            "flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-7 sm:py-5",
            "border-navy/8",
            "dark:border-gold/20",
          )}
        >
          <div className="min-w-0">
            <p className={pdpKicker}>ATELIER FILE</p>
            <h2
              className={cn(
                "mt-1 text-base font-black sm:text-lg lg:text-xl",
                "text-navy",
                "dark:text-ivory",
              )}
            >
              جزئیات، سایز و نظرها
            </h2>
          </div>
          <TabsList
            className={cn(
              "grid h-auto w-full max-w-full grid-cols-3 gap-1 rounded-full p-1 sm:inline-flex sm:w-max sm:p-1.5",
              "border-navy/8 border bg-white",
              "dark:border-gold/30 dark:bg-slate",
            )}
          >
            <TabsTrigger value="info" className={TRIGGER}>
              معرفی
            </TabsTrigger>
            <TabsTrigger value="size" className={TRIGGER}>
              راهنمای سایز
            </TabsTrigger>
            <TabsTrigger value="rev" className={TRIGGER}>
              نظر خریداران
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-4 sm:p-7">
          <TabsContent value="info" className="mt-0">
            <div className="grid min-w-0 items-start gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,.8fr)]">
              <div
                className={`${pdpWell} text-navy/70 dark:text-wheat p-4 text-sm leading-8 sm:p-6`}
              >
                <p className="text-navy dark:text-ivory mb-3 flex items-center gap-2 text-sm font-black">
                  <Sparkles className="text-gold size-4" />
                  معرفی مدل
                </p>
                <LiveDesc product={product} />
                <p className="mt-3">
                  دوخت ایرانی، پارچه گواهی‌شده و پرو مجازی پیش از خرید.
                </p>
              </div>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-1">
                <li className={SPEC_ITEM}>
                  <p className={SPEC_LABEL}>دسته‌بندی</p>
                  <p className={SPEC_VALUE}>{product.cat}</p>
                </li>
                {product.season ? (
                  <li className={SPEC_ITEM}>
                    <p className={SPEC_LABEL}>فصل</p>
                    <p className={SPEC_VALUE}>{product.season}</p>
                  </li>
                ) : null}
                <li className={SPEC_ITEM}>
                  <p className={SPEC_LABEL}>موجودی</p>
                  <p className={SPEC_VALUE}>
                    {product.stock ? "آماده ارسال" : "ناموجود"}
                  </p>
                </li>
                <li className={SPEC_ITEM}>
                  <p className={SPEC_LABEL}>فروش</p>
                  <p className={SPEC_VALUE}>{toFaDigits(product.sold)} سفارش</p>
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="size" className="mt-0">
            <p className="text-navy dark:text-ivory mb-3 flex items-center gap-2 text-sm font-black sm:mb-4">
              <Ruler className="text-gold size-4 shrink-0" />
              جدول اندازه‌گیری
            </p>
            <ProductSizeTable />
          </TabsContent>

          <TabsContent value="rev" className="mt-0">
            <div className="max-w-3xl space-y-4">
              <ProductReviews product={product} />
              <ProductReviewForm product={product} />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </section>
  );
}

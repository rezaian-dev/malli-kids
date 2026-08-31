"use client";

import { BadgeCheck, Ruler, Sparkles } from "lucide-react";
import type { Product } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toFaDigits } from "@/lib/format";
import { ProductSizeTable } from "./product-size-table";
import { ProductReviewForm } from "./product-review-form";
import { ProductReviews } from "./product-reviews";
import { LiveDesc } from "./product-live-context";
import { pdpCard, pdpKicker, pdpWell } from "./product-chrome";

const TRIGGER = cn(
  "whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold text-navy/50 transition-colors dark:text-wheat",
  "data-[state=active]:bg-navy data-[state=active]:font-black data-[state=active]:text-cream",
  "dark:data-[state=active]:bg-gold dark:data-[state=active]:text-navy-deep",
);

// 📚 Server-first product tabs with small client leaves.
export function ProductDetailsTabs({ product }: { product: Product }) {
  return (
    <section className={`${pdpCard} mt-10 overflow-hidden sm:mt-12`}>
      <Tabs defaultValue="info" dir="rtl" className="gap-0">
        <div className="border-navy/8 dark:border-gold/20 flex flex-col gap-4 border-b px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <p className={pdpKicker}>ATELIER FILE</p>
            <h2 className="text-navy dark:text-ivory mt-1 text-lg font-black sm:text-xl">
              جزئیات، سایز و نظرها
            </h2>
          </div>
          <TabsList className="border-navy/8 dark:border-gold/30 dark:bg-slate h-auto w-max max-w-full gap-1 overflow-x-auto rounded-full border bg-white p-1.5">
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

        <div className="p-5 sm:p-7">
          <TabsContent value="info" className="mt-0">
            <div className="grid items-start gap-4 lg:grid-cols-[1.4fr_.8fr]">
              <div className={`${pdpWell} text-navy/70 dark:text-wheat p-5 text-sm leading-8 sm:p-6`}>
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
                <li className={`${pdpWell} p-4`}>
                  <p className="text-gold text-[11px] font-bold">دسته‌بندی</p>
                  <p className="text-navy dark:text-ivory mt-1 text-sm font-black">
                    {product.cat}
                  </p>
                </li>
                {product.season ? (
                  <li className={`${pdpWell} p-4`}>
                    <p className="text-gold text-[11px] font-bold">فصل</p>
                    <p className="text-navy dark:text-ivory mt-1 text-sm font-black">
                      {product.season}
                    </p>
                  </li>
                ) : null}
                <li className={`${pdpWell} p-4`}>
                  <p className="text-gold text-[11px] font-bold">موجودی</p>
                  <p className="text-navy dark:text-ivory mt-1 text-sm font-black">
                    {product.stock ? "آماده ارسال" : "ناموجود"}
                  </p>
                </li>
                <li className={`${pdpWell} p-4`}>
                  <p className="text-gold text-[11px] font-bold">فروش</p>
                  <p className="text-navy dark:text-ivory mt-1 text-sm font-black">
                    {toFaDigits(product.sold)} سفارش
                  </p>
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="size" className="mt-0">
            <p className="text-navy dark:text-ivory mb-4 flex items-center gap-2 text-sm font-black">
              <Ruler className="text-gold size-4" />
              جدول اندازه‌گیری
            </p>
            <ProductSizeTable />
          </TabsContent>

          <TabsContent value="rev" className="mt-0">
            <p className="text-navy dark:text-ivory mb-4 flex items-center gap-2 text-sm font-black">
              <BadgeCheck className="text-gold size-4" />
              نظر خریداران تأییدشده
            </p>
            <div className="max-w-3xl space-y-4">
              <ProductReviewForm product={product} />
              <ProductReviews product={product} />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </section>
  );
}

import type { Product } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ProductSizeTable } from "./product-size-table";
import { ProductReviewForm } from "./product-review-form";
import { ProductReviews } from "./product-reviews";
import { LiveDesc } from "./product-live-context";

const TRIGGER = cn(
  "whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold text-navy/50 transition-colors dark:text-wheat",
  "data-[state=active]:bg-navy data-[state=active]:font-black data-[state=active]:text-cream",
  "dark:data-[state=active]:bg-gold dark:data-[state=active]:text-navy-deep",
);

// 📚 Server-first product tabs with small client leaves.
export function ProductDetailsTabs({ product }: { product: Product }) {
  return (
    <section className="mt-16">
      <Tabs defaultValue="info" dir="rtl">
        <TabsList className="border-navy/5 dark:border-gold/30 dark:bg-slate mb-6 h-auto w-max max-w-full gap-1 overflow-x-auto rounded-full border bg-white p-1.5">
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

        <TabsContent value="info">
          <div className="border-navy/5 text-navy/70 dark:border-gold/30 dark:bg-slate dark:text-wheat max-w-3xl rounded-3xl border bg-white p-6 text-sm leading-8">
            <LiveDesc product={product} />
            <p className="mt-3">
              دوخت ایرانی، پارچه گواهی‌شده و پرو مجازی پیش از خرید.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="size">
          <ProductSizeTable />
        </TabsContent>

        <TabsContent value="rev">
          <div className="max-w-3xl space-y-4">
            <ProductReviewForm product={product} />
            <ProductReviews product={product} />
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

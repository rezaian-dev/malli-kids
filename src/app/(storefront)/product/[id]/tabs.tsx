import type { Product } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { SizeTable } from "./size-table";
import { ReviewForm } from "./review-form";
import { ProductReviews } from "./product-reviews";

const TRIGGER = cn(
  "whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold text-navy/50 transition-colors dark:text-wheat",
  "data-[state=active]:bg-navy data-[state=active]:font-black data-[state=active]:text-cream",
  "dark:data-[state=active]:bg-gold dark:data-[state=active]:text-navy-deep",
);

/**
 * تب‌های صفحهٔ محصول — Server Component.
 * خودِ Tabs shadcn حالت انتخاب را نگه می‌دارد، پس هیچ useState دستی لازم نیست.
 * فقط ReviewForm جزیرهٔ client است.
 */
export function ProductTabs({ product }: { product: Product }) {
  return (
    <section className="mt-16">
      <Tabs defaultValue="info" dir="rtl">
        <TabsList className="mb-6 h-auto w-max max-w-full gap-1 overflow-x-auto rounded-full border border-navy/5 bg-white p-1.5 dark:border-gold/30 dark:bg-slate">
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
          <div className="max-w-3xl rounded-3xl border border-navy/5 bg-white p-6 text-sm leading-8 text-navy/70 dark:border-gold/30 dark:bg-slate dark:text-wheat">
            <p>{product.desc}</p>
            <p className="mt-3">دوخت ایرانی، پارچه گواهی‌شده و پرو مجازی پیش از خرید.</p>
          </div>
        </TabsContent>

        <TabsContent value="size">
          <SizeTable />
        </TabsContent>

        <TabsContent value="rev">
          <div className="max-w-3xl space-y-4">
            <ReviewForm product={product} />
            <ProductReviews product={product} />
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

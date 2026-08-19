"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ProductCard } from "@/components/product";
import { OrnStar } from "../home-ornaments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

const TABS = ["همه", "دخترانه", "پسرانه", "سیسمونی"] as const;
type FilterTab = (typeof TABS)[number];

const TRIGGER = cn(
  "inline-flex min-h-9 items-center justify-center whitespace-nowrap rounded-full px-2.5 text-[11px] font-extrabold text-navy/70 transition-colors min-[360px]:px-4 min-[360px]:text-xs sm:min-h-10 sm:px-5 sm:text-sm dark:text-khaki",
  "data-[state=active]:bg-navy data-[state=active]:text-ivory data-[state=active]:shadow-md",
  "dark:data-[state=active]:bg-gold dark:data-[state=active]:text-navy-deep",
);

/** 🃏 فیلترِ «استایل‌های منتخب». برخلافِ نسخهٔ قبلی (یک TabsContent جدا به‌ازای
 *  هر تب)، اینجا فقط یک TabsContent وجود دارد که مقدارش همیشه برابرِ تبِ فعال
 *  است — پس Radix هیچ‌وقت آن را unmount نمی‌کند. با تعویضِ فیلتر فقط زیرمجموعهٔ
 *  همان یک گرید عوض می‌شود، برای همین کارت‌های مشترک بین دو تب واقعاً به
 *  موقعیتِ جدیدشان حرکت می‌کنند (layout)، نه اینکه یک لیستِ تازه جایگزینِ قبلی
 *  شود. ترتیب/ورود/خروجِ کارت‌ها خودِ `ProductCardGrid` (حالتِ `stack`) هندل
 *  می‌کند؛ این کامپوننت فقط state و فیلتر است. */
export function StylesFilter({ catalog }: { catalog: Product[] }) {
  const [tab, setTab] = useState<FilterTab>("همه");
  const items = tab === "همه" ? catalog : catalog.filter((p) => p.cat === tab);

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as FilterTab)} dir="rtl">
      <div className="mb-10 flex flex-col justify-between gap-5 sm:mb-12 sm:gap-6 lg:flex-row lg:items-end">
        <div>
          <span className="text-gold text-sm font-bold tracking-wide">
            انتخاب سردبیر
          </span>
          <h2
            className={cn(
              "mt-2",
              "text-navy text-[clamp(1.5rem,5.5vw,2.625rem)] leading-snug font-black",
              "dark:text-ivory",
            )}
          >
            استایل‌های{" "}
            <span className="text-gold relative inline-block">
              منتخب
              <OrnStar className="absolute -top-3 -left-4 h-4 w-4" />
            </span>
          </h2>
        </div>

        <div className="flex w-full justify-center lg:w-auto">
          <TabsList
            className={cn(
              "h-auto max-w-full flex-nowrap justify-center gap-0.5 rounded-full border p-2 shadow-sm min-[360px]:gap-1 sm:gap-1.5 sm:p-2.5",
              "border-navy/5 bg-white",
              "dark:border-gold/20 dark:bg-dusk-alt",
            )}
          >
            {TABS.map((name) => (
              <TabsTrigger key={name} value={name} className={TRIGGER}>
                {name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>

      <TabsContent value={tab} className="mt-0">
        {/* `layout` روی خودِ گرید هم هست تا وقتی تعدادِ ردیف‌ها با فیلتر عوض
            می‌شود، ارتفاعِ کانتینر هم نرم (با transform، نه height خام)
            جابه‌جا شود — نه یک پرشِ ناگهانی. */}
        <motion.div
          layout
          className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-[repeat(auto-fill,minmax(13.5rem,1fr))] sm:gap-4"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((p, index) => (
              <ProductCard key={p.id} p={p} view="grid" stack index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      </TabsContent>
    </Tabs>
  );
}

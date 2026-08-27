import { CORE_PRODUCTS } from "@/lib/data/products";
import { Card } from "@/features/product";
import { OrnStar } from "@/features/home/components/ornaments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const TABS = ["همه", "دخترانه", "پسرانه", "سیسمونی"] as const;

const TRIGGER = cn(
  "inline-flex min-h-9 items-center justify-center whitespace-nowrap rounded-full px-4 text-xs font-extrabold text-navy/55 transition-colors sm:min-h-10 sm:px-5 sm:text-sm dark:text-khaki",
  "data-[state=active]:bg-navy data-[state=active]:text-ivory data-[state=active]:shadow-md",
  "dark:data-[state=active]:bg-gold dark:data-[state=active]:text-navy-deep",
);

/**
 * استایل‌های منتخب — Server Component.
 * فیلتر دسته با Tabs shadcn انجام می‌شود (بدون useState/useMemo)؛ هر چهار
 * گرید روی سرور رندر و در HTML اولیه ارسال می‌شوند.
 */
export function Styles() {
  return (
    <section id="styles" className="bg-transparent py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7">
        <Tabs defaultValue="همه" dir="rtl">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:mb-12 sm:gap-6 lg:flex-row lg:items-end">
            <div>
              <span className="text-sm font-bold tracking-wide text-gold">انتخاب سردبیر</span>
              <h2 className="mt-2 text-[clamp(1.5rem,5.5vw,2.625rem)] font-black leading-snug text-navy dark:text-ivory">
                استایل‌های{" "}
                <span className="relative inline-block text-gold">
                  منتخب
                  <OrnStar className="absolute -top-3 -left-4 h-4 w-4" />
                </span>
              </h2>
            </div>

            <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
              <TabsList className="h-auto w-max gap-1 rounded-full border border-navy/5 bg-white p-2 shadow-sm sm:gap-1.5 sm:p-2.5 dark:border-gold/20 dark:bg-dusk-alt">
                {TABS.map((name) => (
                  <TabsTrigger key={name} value={name} className={TRIGGER}>
                    {name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {TABS.map((name) => {
            const items = name === "همه" ? CORE_PRODUCTS : CORE_PRODUCTS.filter((p) => p.cat === name);
            return (
              <TabsContent key={name} value={name} className="mt-0">
                {/* زیر ۳۶۰px تک‌ستونه تا کارت‌ها له نشوند */}
                <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 min-[420px]:gap-4 sm:gap-6 lg:grid-cols-4">
                  {items.map((p, i) => (
                    <div key={p.id} className="animate-style-in" style={{ animationDelay: `${i * 72}ms` }}>
                      <Card p={p} view="grid" />
                    </div>
                  ))}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </section>
  );
}

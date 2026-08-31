import { CORE_PRODUCTS } from "@/lib/data/products";
import { ProductCard } from "@/components/product";
import { OrnStar } from "@/components/home/home-ornaments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const TABS = ["همه", "دخترانه", "پسرانه", "سیسمونی"] as const;

const TRIGGER = cn(
  "inline-flex min-h-9 items-center justify-center whitespace-nowrap rounded-full px-2.5 text-[11px] font-extrabold text-navy/55 transition-colors min-[360px]:px-4 min-[360px]:text-xs sm:min-h-10 sm:px-5 sm:text-sm dark:text-khaki",
  "data-[state=active]:bg-navy data-[state=active]:text-ivory data-[state=active]:shadow-md",
  "dark:data-[state=active]:bg-gold dark:data-[state=active]:text-navy-deep",
);

export function Styles() {
  return (
    <section id="styles" className="bg-transparent py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7">
        <Tabs defaultValue="همه" dir="rtl">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:mb-12 sm:gap-6 lg:flex-row lg:items-end">
            <div>
              <span className="text-gold text-sm font-bold tracking-wide">
                انتخاب سردبیر
              </span>
              <h2 className="text-navy dark:text-ivory mt-2 text-[clamp(1.5rem,5.5vw,2.625rem)] leading-snug font-black">
                استایل‌های{" "}
                <span className="text-gold relative inline-block">
                  منتخب
                  <OrnStar className="absolute -top-3 -left-4 h-4 w-4" />
                </span>
              </h2>
            </div>

            {}
            <div className="flex w-full justify-center lg:w-auto">
              <TabsList className="border-navy/5 dark:border-gold/20 dark:bg-dusk-alt h-auto max-w-full flex-nowrap justify-center gap-0.5 rounded-full border bg-white p-2 shadow-sm min-[360px]:gap-1 sm:gap-1.5 sm:p-2.5">
                {TABS.map((name) => (
                  <TabsTrigger key={name} value={name} className={TRIGGER}>
                    {name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {TABS.map((name) => {
            const items =
              name === "همه"
                ? CORE_PRODUCTS
                : CORE_PRODUCTS.filter((p) => p.cat === name);
            return (
              <TabsContent key={name} value={name} className="mt-0">
                {}
                <div className="grid grid-cols-[repeat(auto-fill,minmax(13.5rem,1fr))] gap-4">
                  {items.map((p, i) => (
                    <div
                      key={p.id}
                      className="animate-style-in"
                      style={{ animationDelay: `${i * 72}ms` }}
                    >
                      <ProductCard p={p} view="grid" />
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

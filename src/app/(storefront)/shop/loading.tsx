import { Search, SlidersHorizontal, Tag } from "lucide-react";
import { CATS } from "@/lib/constants";
import { SEASONS } from "@/lib/data/products";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ProductCardGridSkeleton } from "@/components/product/product-card-skeleton";
import { PRODUCT_GRID } from "@/components/product/card-styles";

const FILTER_ICON_BADGE =
  "bg-navy text-gold-soft dark:bg-gold dark:text-navy-deep grid size-10 place-items-center rounded-2xl";
const FILTER_CHIP =
  "rounded-full border border-gold/25 bg-navy-mid px-3.5 py-1.5 text-xs font-black text-wheat";
const SECTION_LABEL =
  "flex items-center gap-1.5 text-[11px] font-black tracking-[0.16em] text-gold uppercase";
const STATUS = [
  ["فقط موجود", "کالاهای آمادهٔ ارسال"],
  ["تخفیف‌دار", "دارای قیمت ویژه"],
  ["پرفروش", "منتخب مادران"],
  ["جدید", "تازه به گالری رسیده"],
] as const;

function StaticChipGroup({ items }: { items: readonly string[] }) {
  return (
    <div className="flex flex-wrap justify-start gap-1.5">
      {items.map((item) => (
        <span key={item} className={FILTER_CHIP}>
          {item}
        </span>
      ))}
    </div>
  );
}

function StaticFilterPanel() {
  return (
    <div
      aria-hidden
      className="min-h-0 flex-1 scrollbar-thin space-y-6 overflow-y-auto px-4 py-5"
    >
      <div className="space-y-2.5">
        <p className={SECTION_LABEL}>
          <Search className="size-3.5" /> جستجو
        </p>
        <div className="flex h-12 items-center gap-2 rounded-2xl border border-gold/30 bg-navy-mid px-4 text-sm font-bold text-wheat">
          <Search className="size-4 text-gold" />
          <span>پیراهن، سیسمونی…</span>
        </div>
      </div>

      <div className="space-y-2.5">
        <p className={SECTION_LABEL}>
          <Tag className="size-3.5" /> دسته‌بندی
        </p>
        <StaticChipGroup items={CATS} />
      </div>

      <div className="space-y-2.5">
        <p className={SECTION_LABEL}>
          <Tag className="size-3.5" /> فصل
        </p>
        <StaticChipGroup items={["همه", ...SEASONS]} />
      </div>

      <div className="space-y-2.5">
        <p className={SECTION_LABEL}>وضعیت کالا</p>
        <div className="space-y-2">
          {STATUS.map(([label, hint]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-3 rounded-2xl border border-gold/20 bg-navy-mid/60 px-3.5 py-2.5"
            >
              <span className="min-w-0">
                <span className="block text-[13px] font-extrabold text-ivory">
                  {label}
                </span>
                <span className="block text-[10.5px] font-bold text-wheat">
                  {hint}
                </span>
              </span>
              <span className="relative h-6 w-11 shrink-0 rounded-full border border-white/15 bg-white/10">
                <span className="absolute end-0.5 top-0.5 size-5 rounded-full bg-white shadow" />
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className={SECTION_LABEL}>بازه قیمت</p>
        <div className="rounded-2xl border border-gold/20 bg-navy-mid/60 p-4">
          <div className="mb-4 flex items-center justify-between text-xs font-black text-ivory">
            <span className="rounded-lg bg-dusk-soft px-2.5 py-1">۰ تومان</span>
            <span className="text-[10px] font-bold text-wheat">تومان</span>
            <span className="rounded-lg bg-dusk-soft px-2.5 py-1">
              ۴٬۰۰۰٬۰۰۰+
            </span>
          </div>
          <div className="h-2 rounded-full bg-navy-deep">
            <div className="h-2 w-full rounded-full bg-linear-to-l from-gold to-gold-light" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {["هر قیمتی", "اقتصادی", "متوسط", "بالا", "لوکس"].map(
            (label, index) => (
              <span
                key={label}
                className={`flex h-auto flex-col rounded-2xl border border-gold/20 bg-navy-mid px-3 py-2.5 text-right text-ivory ${index === 0 ? "col-span-2" : ""}`}
              >
                <span className="text-xs font-black">{label}</span>
                <span className="mt-0.5 text-[10px] font-bold text-wheat">
                  {index === 0 ? "بدون محدودیت" : "بازه قیمت"}
                </span>
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function StaticToolbar() {
  return (
    <div className="mb-4 flex flex-col justify-between gap-3 border-b border-navy/6 pb-4 dark:border-gold/15 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-lg font-black text-navy dark:text-ivory sm:text-xl">
          کالکشن پوشاک کودک
        </h1>
        <p className="mt-1 text-xs font-normal text-navy/70 dark:text-wheat">
          در حال دریافت کالاها…
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2" aria-hidden>
        <span className="flex h-10 items-center gap-1.5 rounded-full bg-navy px-4 text-xs font-black text-ivory lg:hidden">
          <SlidersHorizontal className="size-4" /> فیلتر
        </span>
        <span className="flex h-10 items-center gap-1.5 rounded-full border border-navy/12 bg-sand px-4 text-xs font-black text-navy dark:border-gold/40 dark:bg-dusk-mid dark:text-linen">
          جدیدترین
        </span>
        <span className="size-9 rounded-full border border-navy/10 bg-sand dark:border-gold/30 dark:bg-dusk-mid" />
      </div>
    </div>
  );
}

export default function ShopLoading() {
  return (
    <div
      aria-label="در حال دریافت کالاهای فروشگاه"
      className="shop-page xs:px-4 mx-auto w-full max-w-7xl px-3 sm:px-5 lg:px-7"
    >
      <Breadcrumb
        schema={false}
        animate={false}
        items={[
          { name: "خانه", path: "/" },
          { name: "فروشگاه", path: "/shop" },
        ]}
      />

      <div className="grid items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-7">
        <aside
          aria-label="فیلتر محصولات"
          className="sticky top-30 hidden h-[calc(100dvh-7.5rem)] min-h-0 max-h-[calc(100dvh-7.5rem)] overflow-hidden rounded-[28px] border border-navy/10 bg-sand-deep/60 shadow-[0_20px_44px_-28px_rgba(14,42,71,.4)] backdrop-blur-sm lg:flex lg:flex-col dark:border-gold/40 dark:bg-filter-night"
        >
          <div className="flex shrink-0 items-center gap-2.5 border-b border-navy/8 bg-white/70 px-4 py-4 dark:border-gold/20 dark:bg-navy-dark/60">
            <span className={FILTER_ICON_BADGE}>
              <SlidersHorizontal className="size-4" />
            </span>
            <div>
              <p className="text-sm font-black text-navy dark:text-ivory">
                فیلتر محصولات
              </p>
              <p className="mt-0.5 text-[10px] font-bold text-navy/70 dark:text-gold-soft">
                بدون فیلتر
              </p>
            </div>
          </div>
          <StaticFilterPanel />
        </aside>

        <section className="min-w-0 rounded-[28px] border border-navy/10 bg-white/85 p-3 shadow-[0_22px_54px_-30px_rgba(14,42,71,.32)] backdrop-blur-sm sm:p-5 dark:border-gold/35 dark:bg-slate/45">
          <StaticToolbar />
          <div
            className={PRODUCT_GRID}
            aria-busy="true"
            aria-label="در حال بارگذاری کالاها"
          >
            {Array.from({ length: 9 }, (_, i) => (
              <ProductCardGridSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

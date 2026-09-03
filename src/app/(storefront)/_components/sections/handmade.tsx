import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { ProductCard } from "@/components/product";
import { OrnBow } from "../home-ornaments";
import { CORE_PRODUCTS } from "@/lib/data/products";
import { cn } from "@/lib/utils";

export function Handmade() {
  return (
    <section
      id="handmade"
      className={cn(
        "relative cv-auto overflow-hidden py-12 sm:py-16 lg:py-20",
        "bg-navy bg-[radial-gradient(rgba(255,255,255,.09)_1px,transparent_1px)] bg-size-[22px_22px]",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -top-32 right-1/4 h-100 w-100 rounded-full blur-3xl",
          "bg-gold/10",
        )}
      />
      <div className="relative container mx-auto w-full px-4 sm:px-5 lg:px-7">
        <div className="mb-10 flex flex-col justify-between gap-5 transition-all duration-700 ease-out sm:mb-12 sm:flex-row sm:items-end">
          <div>
            <span className="text-gold-light flex items-center gap-2 text-sm font-bold tracking-wide">
              <Heart className="fill-gold text-gold h-4 w-4" />
              کالکشن دست‌ساز
            </span>
            <h2 className="mt-2 text-[clamp(1.5rem,5.5vw,2.625rem)] leading-snug font-black text-white">
              دستدوزهای{" "}
              <span className="relative inline-block">
                خاص
                <OrnBow className="absolute -top-5 left-1/2 h-5 w-8 -translate-x-1/2" />
              </span>
            </h2>
            <p className="text-cream/55 mt-3 max-w-xl text-sm leading-7 sm:text-[15px]">
              هر قطعه با دست هنرمندان ایرانی و با کاموای درجه‌یک بافته می‌شود؛
              هیچ دو قطعه‌ای دقیقاً شبیه هم نیست — درست مثل فرزند شما.
            </p>
          </div>
          <Link
            href="/shop?category=دستدوز"
            className={cn(
              "inline-flex w-max shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition-all sm:px-6 sm:py-3",
              "border-gold/40 text-gold-light hover:bg-gold hover:text-navy-deep",
            )}
          >
            مشاهده همه
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        <div
          id="handmadeGrid"
          className="grid grid-cols-[repeat(auto-fill,minmax(13.5rem,1fr))] gap-4 transition-all duration-700 ease-out"
        >
          {CORE_PRODUCTS.slice(0, 8).map((product) => (
            <ProductCard key={product.id} p={product} view="grid" />
          ))}
        </div>
      </div>
    </section>
  );
}

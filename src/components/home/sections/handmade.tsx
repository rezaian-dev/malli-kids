import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { ProductCard } from "@/components/product";
import { OrnBow } from "@/components/home/home-ornaments";
import { CORE_PRODUCTS } from "@/lib/data/products";

export function Handmade() {
  return (
    <section id="handmade" className="relative overflow-hidden bg-navy bg-[radial-gradient(rgba(255,255,255,.09)_1px,transparent_1px)] bg-size-[22px_22px] py-12 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute right-1/4 -top-32 h-100 w-100 rounded-full bg-gold/10 blur-3xl" />
      <div className="relative container mx-auto w-full px-4 sm:px-5 lg:px-7">
        <div className="mb-10 flex flex-col justify-between gap-5 transition-all duration-700 ease-out sm:mb-12 sm:flex-row sm:items-end">
          <div>
            <span className="flex items-center gap-2 text-sm font-bold tracking-wide text-gold-light">
              <Heart className="h-4 w-4 fill-gold text-gold" />
              کالکشن دست‌ساز
            </span>
            <h2 className="mt-2 text-[clamp(1.5rem,5.5vw,2.625rem)] font-black leading-snug text-white">
              دستدوزهای{" "}
              <span className="relative inline-block">
                خاص
                <OrnBow className="absolute left-1/2 -top-5 h-5 w-8 -translate-x-1/2" />
              </span>
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-cream/55 sm:text-[15px]">
              هر قطعه با دست هنرمندان ایرانی و با کاموای درجه‌یک بافته می‌شود؛ هیچ دو قطعه‌ای دقیقاً شبیه هم نیست — درست مثل فرزند شما.
            </p>
          </div>
          <Link href="/shop?cat=دستدوز" className="inline-flex w-max shrink-0 items-center gap-2 rounded-full border border-gold/40 px-5 py-2.5 text-sm font-bold text-gold-light transition-all hover:bg-gold hover:text-navy-deep sm:px-6 sm:py-3">
            مشاهده همه
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        <div id="handmadeGrid" className="grid grid-cols-[repeat(auto-fill,minmax(13.5rem,1fr))] gap-4 transition-all duration-700 ease-out">
          {CORE_PRODUCTS.slice(0, 8).map((product) => (
            <ProductCard key={product.id} p={product} view="grid" />
          ))}
        </div>
      </div>
    </section>
  );
}

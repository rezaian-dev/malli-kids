import Link from "next/link";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ContactBanner() {
  return (
    <section
      className={cn(
        "relative container mx-auto max-w-5xl overflow-hidden rounded-[28px] p-8 sm:px-5 lg:px-7",
        "bg-navy text-cream",
      )}
    >
      <h2 className="text-2xl font-black">از انتخاب نخ تا جعبه کادویی</h2>
      <p className="text-cream/75 mt-3 leading-8">
        گالری ملی‌کیدز در ولیعصر است؛ اما دوخت در کارگاه‌های کوچک ایرانی انجام
        می‌شود.
      </p>
      <p className="text-gold-light mt-4 text-sm">{BRAND.address}</p>
      <Link
        href="/contact"
        className={cn(
          "mt-5 inline-flex rounded-full px-6 py-3 font-black",
          "bg-gold text-navy-deep",
        )}
      >
        تماس و آدرس کامل
      </Link>
    </section>
  );
}

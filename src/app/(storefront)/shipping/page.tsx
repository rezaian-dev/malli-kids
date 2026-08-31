import Link from "next/link";
import { Intro } from "@/components/shared/intro";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "ارسال و بازگشت",
  description: "شرایط ارسال سریع، هزینه پست، بازگشت کالا و ضمانت پارچه در فروشگاه ملی‌کیدز.",
  path: "/shipping",
  keywords: ["ارسال لباس کودک", "بازگشت کالا کودک", "ضمانت پارچه کودک"],
});

export default function ShippingPage() {
  const cards = [
    { t: "ارسال", d: "۲ تا ۴ روز کاری به سراسر کشور. بالای ۱٬۵۰۰٬۰۰۰ تومان رایگان. مدل‌های دستدوز ممکن است زمان دوخت اضافه داشته باشند." },
    { t: "بازگشت ۷ روزه", d: "اگر لباس پوشیده یا شسته نشده باشد تا ۷ روز پس از تحویل برمی‌گردد. کالای معیوب هزینه بازگشت ندارد." },
    { t: "ضمانت پارچه", d: "پارچه‌های اصلی گواهی ضدحساسیت دارند. اگر مشکلی بود، همان پشتیبانی مادری پیگیری می‌کند." },
  ];

  return (
    <>
      <Intro crumb="ارسال و بازگشت" kicker="سیاست فروشگاه" title="ارسال سریع، بازگشت آسان" />
      <div className="container mx-auto grid w-full max-w-5xl gap-4 px-4 sm:px-5 md:grid-cols-3 lg:px-7">
        {cards.map((c) => (
          <article key={c.t} className="rounded-3xl border border-navy/10 bg-white p-5 dark:border-gold/30 dark:bg-dusk">
            <h2 className="text-lg font-black text-navy dark:text-ivory">{c.t}</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{c.d}</p>
          </article>
        ))}
      </div>
      <div className="container mx-auto mt-8 w-full max-w-5xl px-4 sm:px-5 lg:px-7">
        <Button asChild variant="secondary" className="rounded-full">
          <Link href="/faq">سوالات متداول</Link>
        </Button>
      </div>
    </>
  );
}

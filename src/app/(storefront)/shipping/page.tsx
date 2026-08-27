import Link from "next/link";
import { Intro } from "@/components/common/intro";
import { Button } from "@/components/ui/button";


export default function ShippingPage() {
  const cards = [
    { t: "ارسال", d: "۲ تا ۴ روز کاری به سراسر کشور. بالای ۱٬۵۰۰٬۰۰۰ تومان رایگان. مدل‌های دستدوز ممکن است زمان دوخت اضافه داشته باشند." },
    { t: "بازگشت ۷ روزه", d: "اگر لباس پوشیده یا شسته نشده باشد تا ۷ روز پس از تحویل برمی‌گردد. کالای معیوب هزینه بازگشت ندارد." },
    { t: "ضمانت پارچه", d: "پارچه‌های اصلی گواهی ضدحساسیت دارند. اگر مشکلی بود، همان پشتیبانی مادری پیگیری می‌کند." },
  ];
  return (
    <>
<Intro crumb="ارسال و بازگشت" kicker="سیاست فروشگاه" title="ارسال سریع، بازگشت آسان" />
      <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7 max-w-5xl grid md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <article key={c.t} className="rounded-3xl border border-navy/10 dark:border-gold/30 bg-white dark:bg-dusk p-5">
            <h2 className="font-black text-lg text-navy dark:text-ivory">{c.t}</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-7">{c.d}</p>
          </article>
        ))}
      </div>
      <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7 max-w-5xl mt-8">
        <Button asChild variant="secondary" className="rounded-full">
          <Link href="/faq">سوالات متداول</Link>
        </Button>
      </div>
    </>
      );
}

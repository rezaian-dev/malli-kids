import Link from "next/link";
import { Intro } from "@/components/shared/intro";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = buildMetadata({
  title: "ارسال و بازگشت",
  description: "ارسال ۲ تا ۴ روزه، بازگشت ۷ روزه و ضمانت پارچه.",
  path: "/shipping",
});

export default function ShippingPage() {
  const cards = [
    {
      t: "ارسال",
      d: "۲ تا ۴ روز کاری به سراسر کشور. بالای ۱٬۵۰۰٬۰۰۰ تومان رایگان. مدل‌های دستدوز ممکن است زمان دوخت اضافه داشته باشند.",
    },
    {
      t: "بازگشت ۷ روزه",
      d: "اگر لباس پوشیده یا شسته نشده باشد تا ۷ روز پس از تحویل برمی‌گردد. کالای معیوب هزینه بازگشت ندارد.",
    },
    {
      t: "ضمانت پارچه",
      d: "پارچه‌های اصلی گواهی ضدحساسیت دارند. اگر مشکلی بود، همان پشتیبانی مادری پیگیری می‌کند.",
    },
  ];

  return (
    <>
      <Intro
        crumb="ارسال و بازگشت"
        kicker="سیاست فروشگاه"
        title="ارسال سریع، بازگشت آسان"
        path="/shipping"
      />
      <div className="xs:px-4 container mx-auto grid w-full max-w-5xl gap-4 px-3 sm:px-5 md:grid-cols-3 lg:px-7">
        {cards.map((c) => (
          <article
            key={c.t}
            className={cn(
              "rounded-3xl border p-5",
              "border-navy/10 bg-white",
              "dark:border-gold/30 dark:bg-dusk",
            )}
          >
            <h2 className="text-navy dark:text-ivory text-lg font-black">
              {c.t}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-7">
              {c.d}
            </p>
          </article>
        ))}
      </div>
      <div className="xs:px-4 container mx-auto mt-8 w-full max-w-5xl px-3 sm:px-5 lg:px-7">
        <Button asChild variant="secondary" className="rounded-full">
          <Link href="/faq">سوالات متداول</Link>
        </Button>
      </div>
    </>
  );
}

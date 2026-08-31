import { Intro } from "@/components/shared/intro";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "قوانین و مقررات",
  description:
    "شرایط خرید، قیمت‌گذاری، مالکیت محتوا و استفاده از خدمات فروشگاه ملی‌کیدز.",
  path: "/terms",
  keywords: ["قوانین فروشگاه", "مقررات خرید", "شرایط استفاده ملی‌کیدز"],
});

export default function TermsPage() {
  return (
    <>
      <Intro
        crumb="قوانین و مقررات"
        kicker="حقوق و تعهدات"
        title="قوانین و مقررات ملی‌کیدز"
        lead="خرید از ملی‌کیدز به‌معنای پذیرش این شرایط است."
      />
      <div className="container mx-auto w-full max-w-3xl space-y-4 px-4 sm:px-5 lg:px-7">
        {[
          [
            "حساب کاربری",
            "اطلاعات ورود محرمانه است و مسئولیت حفظ رمز با شماست. هر سفارش ثبت‌شده از حساب شما قابل پیگیری است.",
          ],
          [
            "قیمت و موجودی",
            "قیمت‌ها به تومان و هنگام ثبت سفارش قطعی می‌شوند. کالاهای ناموجود قابل افزودن به سبد نیستند.",
          ],
          [
            "مالکیت محتوا",
            "تصاویر، متون و برند ملی‌کیدز متعلق به فروشگاه است و استفاده تجاری بدون اجازه مجاز نیست.",
          ],
        ].map(([t, d]) => (
          <article
            key={t}
            className="border-navy/10 dark:border-gold/30 dark:bg-slate rounded-3xl border bg-white p-5"
          >
            <h2 className="text-navy dark:text-ivory font-black">{t}</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-7">{d}</p>
          </article>
        ))}
      </div>
    </>
  );
}

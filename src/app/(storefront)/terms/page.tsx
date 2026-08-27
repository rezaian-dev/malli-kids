import { Intro } from "@/components/common/intro";


export default function TermsPage() {
  return (
    <>
<Intro crumb="قوانین و مقررات" kicker="حقوق و تعهدات" title="قوانین و مقررات ملی‌کیدز" lead="خرید از ملی‌کیدز به‌معنای پذیرش این شرایط است." />
      <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7 max-w-3xl space-y-4">
        {[
          ["حساب کاربری", "اطلاعات ورود محرمانه است و مسئولیت حفظ رمز با شماست. هر سفارش ثبت‌شده از حساب شما قابل پیگیری است."],
          ["قیمت و موجودی", "قیمت‌ها به تومان و هنگام ثبت سفارش قطعی می‌شوند. کالاهای ناموجود قابل افزودن به سبد نیستند."],
          ["مالکیت محتوا", "تصاویر، متون و برند ملی‌کیدز متعلق به فروشگاه است و استفاده تجاری بدون اجازه مجاز نیست."],
        ].map(([t, d]) => (
          <article key={t} className="rounded-3xl border border-navy/10 dark:border-gold/30 bg-white dark:bg-slate p-5">
            <h2 className="font-black text-navy dark:text-ivory">{t}</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-7">{d}</p>
          </article>
        ))}
      </div>
    </>
      );
}

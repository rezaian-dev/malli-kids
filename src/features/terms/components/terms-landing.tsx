import { Intro } from "@/components/shared/intro";
import { cn } from "@/lib/utils";

const SECTIONS = [
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
];

export function TermsLanding() {
  return (
    <>
      <Intro
        crumb="قوانین و مقررات"
        kicker="حقوق و تعهدات"
        title="قوانین و مقررات ملی‌کیدز"
        lead="خرید از ملی‌کیدز به‌معنای پذیرش این شرایط است."
        path="/terms"
      />
      <div className="xs:px-4 container mx-auto w-full max-w-3xl space-y-4 px-3 sm:px-5 lg:px-7">
        {SECTIONS.map(([t, d]) => (
          <article
            key={t}
            className={cn(
              "rounded-3xl border p-5",
              "border-navy/10 bg-white",
              "dark:border-gold/30 dark:bg-slate",
            )}
          >
            <h2 className="text-navy dark:text-ivory font-black">{t}</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-7">{d}</p>
          </article>
        ))}
      </div>
    </>
  );
}

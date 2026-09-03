import { Lock, Share2, UserRound } from "lucide-react";
import { Intro } from "@/components/shared/intro";
import { cn } from "@/lib/utils";

const ITEMS = [
  {
    Icon: Lock,
    t: "چه چیزی ذخیره می‌شود",
    d: "نام، ایمیل، موبایل، آدرس و سوابق سفارش روی دستگاه شما (نسخه نمایشی) نگهداری می‌شود. رمز عبور را هرگز در متن ساده ذخیره نمی‌کنیم.",
  },
  {
    Icon: Share2,
    t: "اشتراک‌گذاری",
    d: "اطلاعات را به اشخاص ثالث برای تبلیغات نمی‌فروشیم. فقط برای ارسال سفارش ممکن است آدرس به پیک نمایش داده شود.",
  },
  {
    Icon: UserRound,
    t: "حقوق شما",
    d: "هر زمان می‌توانید از حساب خارج شوید یا اطلاعات پروفایل را ویرایش کنید. درخواست حذف داده را از صفحه تماس بفرستید.",
  },
];

export function PrivacyLanding() {
  return (
    <>
      <Intro
        crumb="حریم خصوصی"
        kicker="اطلاعات شما"
        title="حریم خصوصی ملی‌کیدز"
        lead="فقط داده‌هایی را نگه می‌داریم که برای سفارش، ارسال و پشتیبانی لازم است."
        path="/privacy"
      />
      <div className="xs:px-4 container mx-auto w-full max-w-3xl space-y-4 px-3 sm:px-5 lg:px-7">
        {ITEMS.map(({ Icon, t, d }) => (
          <article
            key={t}
            className={cn(
              "flex gap-4 rounded-3xl border p-5 sm:p-6",
              "border-navy/8 hover:border-gold/40 bg-white shadow-[0_18px_40px_-26px_rgba(14,42,71,.28)] transition-all duration-500 hover:-translate-y-1 hover:shadow-xl",
              "dark:border-gold/30 dark:bg-slate",
            )}
          >
            <span
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                "bg-gold/15 text-gold",
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-navy dark:text-ivory font-black">{t}</h2>
              <p className="text-navy/70 dark:text-wheat mt-2 text-sm leading-7">
                {d}
              </p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

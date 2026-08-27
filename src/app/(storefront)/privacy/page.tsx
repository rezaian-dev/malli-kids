import { Intro } from "@/components/shared/intro";
import { Lock, Share2, UserRound } from "lucide-react";


const ITEMS = [
  { Icon: Lock, t: "چه چیزی ذخیره می‌شود", d: "نام، ایمیل، موبایل، آدرس و سوابق سفارش روی دستگاه شما (نسخه نمایشی) نگهداری می‌شود. رمز عبور را هرگز در متن ساده ذخیره نمی‌کنیم." },
  { Icon: Share2, t: "اشتراک‌گذاری", d: "اطلاعات را به اشخاص ثالث برای تبلیغات نمی‌فروشیم. فقط برای ارسال سفارش ممکن است آدرس به پیک نمایش داده شود." },
  { Icon: UserRound, t: "حقوق شما", d: "هر زمان می‌توانید از حساب خارج شوید یا اطلاعات پروفایل را ویرایش کنید. درخواست حذف داده را از صفحه تماس بفرستید." },
];

export default function PrivacyPage() {
  return (
    <>
<Intro crumb="حریم خصوصی" kicker="اطلاعات شما" title="حریم خصوصی ملی‌کیدز" lead="فقط داده‌هایی را نگه می‌داریم که برای سفارش، ارسال و پشتیبانی لازم است." />
        <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7 max-w-3xl space-y-4">
          {ITEMS.map(({ Icon, t, d }) => (
            <article key={t} className="rounded-3xl border border-navy/8 dark:border-gold/30 bg-white dark:bg-slate p-5 sm:p-6 flex gap-4 hover:-translate-y-1 hover:border-gold/40 hover:shadow-xl transition-all">
              <span className="w-11 h-11 shrink-0 rounded-2xl bg-gold/15 text-gold flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </span>
              <div>
                <h2 className="font-black text-navy dark:text-ivory">{t}</h2>
                <p className="text-sm text-navy/55 dark:text-wheat mt-2 leading-7">{d}</p>
              </div>
            </article>
          ))}
        </div>
    </>
        );
}

import Link from "next/link";
import { Intro } from "@/components/shared/intro";
import { Faq } from "@/components/shared/faq";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "سوال‌های پرتکرار",
  description: "پاسخ سوال‌های پرتکرار درباره سایز، ارسال، بازگشت کالا، پشتیبانی و پرو مجازی در ملی‌کیدز.",
  path: "/faq",
  keywords: ["سوالات متداول پوشاک کودک", "راهنمای ارسال کودک", "پشتیبانی ملی‌کیدز"],
});

export default function FaqPage() {
  return (
    <>
      <Intro crumb="سوالات متداول" kicker="پشتیبانی ملی‌کیدز" title="قبل از خرید، این‌ها را بخوانید" lead="پاسخ سوال‌های پرتکرار مادرها درباره سایز، ارسال، بازگشت و پرو مجازی." />
      <div className="container mx-auto w-full max-w-3xl px-4 sm:px-5 lg:px-7">
        <Faq />
        <div className="mt-10 rounded-[26px] border border-navy/8 bg-white/94 p-6 text-center shadow-[0_18px_40px_-26px_rgba(14,42,71,.28)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_22px_44px_-22px_rgba(193,147,87,.28)] dark:border-gold/30 dark:bg-slate/60">
          <p className="font-black leading-snug text-navy dark:text-ivory">جوابتان را پیدا نکردید؟</p>
          <p className="mt-2 text-sm text-navy/55 dark:text-wheat">پشتیبانی مادری هر روز هفته پاسخ می‌دهد.</p>
          <Link href="/contact" className="mt-4 inline-flex rounded-full bg-navy px-6 py-3 font-black text-ivory transition-transform hover:-translate-y-0.5 dark:bg-gold dark:text-navy-deep">
            تماس با گالری
          </Link>
        </div>
      </div>
    </>
  );
}

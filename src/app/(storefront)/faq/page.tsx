import type { Metadata } from "next";
import { Intro } from "@/components/shared/intro";
import { Faq } from "@/components/shared/faq";
import Link from "next/link";

export const metadata: Metadata = {
  title: "سوال‌های پرتکرار",
  description: "پاسخ سوال‌های پرتکرار مادرها دربارهٔ سایز، ارسال، بازگشت کالا و پرو مجازی.",
};

export default function FaqPage() {
  return (
    <>
<Intro crumb="سوالات متداول" kicker="پشتیبانی ملی‌کیدز" title="قبل از خرید، این‌ها را بخوانید" lead="پاسخ سوال‌های پرتکرار مادرها درباره سایز، ارسال، بازگشت و پرو مجازی." />
        <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7 max-w-3xl">
          <Faq />
          <div className="rounded-[26px] border border-navy/8 bg-white/94 shadow-[0_18px_40px_-26px_rgba(14,42,71,.28)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_22px_44px_-22px_rgba(193,147,87,.28)] dark:border-gold/30 dark:bg-slate/60 mt-10 p-6 text-center">
            <p className="font-black leading-snug text-navy dark:text-ivory">جوابتان را پیدا نکردید؟</p>
            <p className="text-navy/55 dark:text-wheat mt-2 text-sm">پشتیبانی مادری هر روز هفته پاسخ می‌دهد.</p>
            <Link href="/contact" className="mt-4 inline-flex rounded-full bg-navy px-6 py-3 font-black text-ivory transition-transform hover:-translate-y-0.5 dark:bg-gold dark:text-navy-deep">
              تماس با گالری
            </Link>
          </div>
        </div>
    </>
        );
}

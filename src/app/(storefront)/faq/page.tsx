import { Intro } from "@/components/shared/intro";
import { Faq } from "@/components/shared/faq";
import Link from "next/link";


export default function FaqPage() {
  return (
    <>
<Intro crumb="سوالات متداول" kicker="پشتیبانی ملی‌کیدز" title="قبل از خرید، این‌ها را بخوانید" lead="پاسخ سوال‌های پرتکرار مادرها درباره سایز، ارسال، بازگشت و پرو مجازی." />
        <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7 max-w-3xl">
          <Faq />
          <div className="lux-card mt-10 p-6 text-center">
            <p className="lux-title">جوابتان را پیدا نکردید؟</p>
            <p className="lux-muted mt-2 text-sm">پشتیبانی مادری هر روز هفته پاسخ می‌دهد.</p>
            <Link href="/contact" className="mt-4 inline-flex rounded-full bg-navy px-6 py-3 font-black text-ivory transition-transform hover:-translate-y-0.5 dark:bg-gold dark:text-navy-deep">
              تماس با گالری
            </Link>
          </div>
        </div>
    </>
        );
}

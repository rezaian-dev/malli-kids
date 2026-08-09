import Link from "next/link";

import { Faq } from "./faq";
import { Intro } from "@/components/shared/intro";
import { JsonLd } from "@/components/shared/json-ld";
import { FAQ } from "@/lib/data/pages";
import { faqSchema } from "@/lib/seo";
import { cn } from "@/lib/utils";

export function FaqLanding() {
  return (
    <>
      <Intro
        crumb="سوالات متداول"
        kicker="پشتیبانی ملی‌کیدز"
        title="قبل از خرید، این‌ها را بخوانید"
        lead="پاسخ سوال‌های پرتکرار مادرها درباره سایز، ارسال، بازگشت و پرو مجازی."
        path="/faq"
        schemaType="FAQPage"
      />
      <JsonLd data={faqSchema(FAQ)} />
      <div className="xs:px-4 container mx-auto w-full max-w-3xl px-3 sm:px-5 lg:px-7">
        {/* ♿ Each accordion question renders as an h3 (Radix's Accordion
            Header default) — without this, the page jumps h1 → h3 and
            skips a level. Visually hidden since Intro's h1 already reads
            fine on its own here. */}
        <h2 className="sr-only">سوالات متداول</h2>
        <Faq />
        <div
          className={cn(
            "mt-10 rounded-[26px] border p-6 text-center",
            "border-navy/8 hover:border-gold/50 bg-white/94 shadow-[0_18px_40px_-26px_rgba(14,42,71,.28)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_22px_44px_-22px_rgba(193,147,87,.28)]",
            "dark:border-gold/30 dark:bg-slate/60",
          )}
        >
          <p className="text-navy dark:text-ivory leading-snug font-black">
            جوابتان را پیدا نکردید؟
          </p>
          <p className="text-navy/70 dark:text-wheat mt-2 text-sm">
            پشتیبانی مادری هر روز هفته پاسخ می‌دهد.
          </p>
          <Link
            href="/contact"
            className={cn(
              "mt-4 inline-flex rounded-full px-6 py-3 font-black transition-transform hover:-translate-y-0.5",
              "bg-navy text-ivory",
              "dark:bg-gold dark:text-navy-deep",
            )}
          >
            تماس با گالری
          </Link>
        </div>
      </div>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, Handshake, Headphones, MapPin, Phone } from "lucide-react";
import { Intro } from "@/components/shared/intro";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";
import { ContactMap } from "./_components/contact-map";

export const metadata: Metadata = {
  title: "تماس با ما",
  description: "پشتیبانی مالی کیدز از طریق سایت؛ پاسخ سوال‌ها، پیگیری سفارش و آدرس گالری.",
};

export default function ContactPage() {
  return (
    <>
      <Intro
        crumb="تماس با ما"
        kicker="گالری و پشتیبانی"
        title="کنارتان هستیم"
        lead="پشتیبانی ما فقط از طریقِ سایت است؛ هر سوالی بپرسید، پاسخش را در پنلِ کاربریِ خودتان می‌بینید. برای دیدنِ لباس‌ها از نزدیک هم گالریِ ولیعصر میزبانِ شماست."
      />

      <div className="container mx-auto w-full max-w-5xl space-y-9 px-4 sm:px-5 lg:px-7">
        {}
        <section className="overflow-hidden rounded-[28px] bg-linear-to-br from-navy via-navy-mid to-navy-light px-6 py-8 shadow-[0_24px_60px_-30px_rgba(4,20,39,.6)] sm:px-10 sm:py-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-[11px] font-black tracking-[0.22em] text-gold">
                <Headphones className="size-4" /> SUPPORT
              </p>
              <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">پشتیبانی، در پنلِ خودتان</h2>
              <p className="mt-3 max-w-xl text-sm leading-8 text-white/75">
                سوالِ سایز، پیگیریِ سفارش یا هر چیزِ دیگر — به‌جای فرم و ایمیل، تیکت ثبت کنید؛
                پاسخِ ما فقط و فقط در پنلِ کاربریِ خودتان ثبت می‌شود، همیشه در دسترس و هرگز گم‌نشده.
              </p>

              <ol className="mt-7 grid gap-4 sm:grid-cols-3">
                {[
                  ["۱", "وارد شوید", "با موبایل یا ایمیل، چند ثانیه"],
                  ["۲", "تیکت بزنید", "در تبِ «پشتیبانی» پنلِ کاربری"],
                  ["۳", "پاسخ بگیرید", "همان‌جا، در پنلِ خودتان"],
                ].map(([n, t, d]) => (
                  <li key={n} className="rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-4">
                    <span className="grid size-8 place-items-center rounded-full bg-gold font-black text-navy-deep">{n}</span>
                    <p className="mt-3 text-sm font-black text-white">{t}</p>
                    <p className="mt-1 text-[11px] font-bold leading-5 text-white/60">{d}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row lg:flex-col">
              <Button asChild variant="gold" size="pill" className="h-12 px-7">
                <Link href="/profile#support">
                  ورود و ثبتِ تیکت <ArrowLeft className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-full border-white/30 bg-white/10 px-7 text-white hover:bg-white/15">
                <Link href="/faq">سوالاتِ پرتکرار</Link>
              </Button>
            </div>
          </div>
        </section>

        {}
        <section>
          <h2 className="text-[11px] font-black tracking-[0.22em] text-gold">راه‌های ارتباطی</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Info ico={Phone} k="تلفن" v={BRAND.phoneFa} href={`tel:${BRAND.phone}`} ltr />
            <Info ico={MapPin} k="نشانیِ گالری" v={BRAND.address} />
            <Info ico={Clock} k="ساعتِ پاسخگویی" v="شنبه تا پنجشنبه، ۹ صبح تا ۹ شب" />
          </div>
        </section>

        <ContactMap />
      </div>
    </>
  );
}

function Info({ ico: Icon, k, v, href, ltr }: { ico: typeof MapPin; k: string; v: string; href?: string; ltr?: boolean }) {
  const body = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-black text-gold dark:text-gold-glow">{k}</span>
        <span className="mt-1 block font-bold text-navy dark:text-ivory" dir={ltr ? "ltr" : undefined}>
          {v}
        </span>
      </span>
    </>
  );
  const cls = "rounded-[26px] border border-navy/8 bg-white/94 shadow-[0_18px_40px_-26px_rgba(14,42,71,.28)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_22px_44px_-22px_rgba(193,147,87,.28)] dark:border-gold/30 dark:bg-slate/60 flex items-start gap-3 p-4";
  return href ? (
    <a href={href} className={cls}>
      {body}
    </a>
  ) : (
    <div className={`${cls} hover:translate-y-0`}>{body}</div>
  );
}

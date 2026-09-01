import Link from "next/link";
import { Heart, ScanFace, Scissors, ShieldCheck } from "lucide-react";
import { Intro } from "@/components/shared/intro";
import { BRAND } from "@/lib/constants";
import { ABOUT } from "@/lib/data/pages";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "درباره ما",
  description: "آتلیه پوشاک کودک با دوخت ایرانی و پارچه‌های امن.",
  path: "/about",
});

const ICONS = [Heart, Scissors, ScanFace, ShieldCheck];

export default function AboutPage() {
  return (
    <>
      <Intro
        crumb={ABOUT.crumb}
        kicker={ABOUT.kicker}
        title={ABOUT.title}
        lead={ABOUT.lead}
        path="/about"
        schemaType="AboutPage"
      />

      <div className="container mx-auto mb-10 flex max-w-5xl flex-wrap gap-3 px-3 sm:px-5 lg:px-7">
        <Link
          href="/shop"
          className="bg-navy text-ivory shadow-navy/20 inline-flex rounded-full px-6 py-3 font-black shadow-lg transition-transform hover:-translate-y-0.5"
        >
          مشاهده کالکشن
        </Link>
        <Link
          href="/tryon"
          className="border-gold text-gold inline-flex rounded-full border-2 px-6 py-3 font-black transition-transform hover:-translate-y-0.5"
        >
          پرو مجازی
        </Link>
      </div>

      <div className="container mx-auto mb-14 grid max-w-5xl grid-cols-2 gap-3 px-3 sm:grid-cols-5 sm:px-5 lg:px-7">
        {ABOUT.stats.map((s) => (
          <div
            key={s.n}
            className="border-navy/8 hover:border-gold/50 dark:border-gold/30 dark:bg-slate/60 rounded-[26px] border bg-white/94 p-4 text-center shadow-[0_18px_40px_-26px_rgba(14,42,71,.28)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_22px_44px_-22px_rgba(193,147,87,.28)]"
          >
            <p className="text-navy dark:text-ivory text-xl font-black">
              {s.n}
            </p>
            <p className="text-navy/50 dark:text-wheat mt-1 text-[11px] leading-5">
              {s.l}
            </p>
          </div>
        ))}
      </div>

      <section className="container mx-auto mb-14 max-w-5xl px-3 sm:px-5 lg:px-7">
        <h2 className="text-navy dark:text-ivory mb-6 text-2xl font-black">
          از یک کارگاه کوچک تا بوتیک ملی‌کیدز
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {ABOUT.story.map((s) => (
            <article
              key={s.n}
              className="border-navy/8 hover:border-gold/50 dark:border-gold/30 dark:bg-slate/60 rounded-[26px] border bg-white/94 p-5 shadow-[0_18px_40px_-26px_rgba(14,42,71,.28)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_22px_44px_-22px_rgba(193,147,87,.28)]"
            >
              <p className="text-gold font-black">{s.n}</p>
              <h3 className="text-navy dark:text-ivory mt-2 font-black">
                {s.t}
              </h3>
              <p className="text-navy/55 dark:text-wheat mt-2 text-sm leading-7">
                {s.d}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="container mx-auto mb-14 max-w-5xl px-3 sm:px-5 lg:px-7">
        <h2 className="text-navy dark:text-ivory mb-6 text-2xl font-black">
          چهار قول به شما
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {ABOUT.promises.map((p, i) => {
            const Icon = ICONS[i] ?? Heart;
            return (
              <article
                key={p.t}
                className="border-navy/8 hover:border-gold/50 dark:border-gold/30 dark:bg-slate/60 flex gap-4 rounded-[26px] border bg-white/94 p-5 shadow-[0_18px_40px_-26px_rgba(14,42,71,.28)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_22px_44px_-22px_rgba(193,147,87,.28)]"
              >
                <span className="bg-gold/15 text-gold flex size-11 shrink-0 items-center justify-center rounded-2xl">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="text-navy dark:text-ivory font-black">
                    {p.t}
                  </h3>
                  <p className="text-navy/55 dark:text-wheat mt-2 text-sm leading-7">
                    {p.d}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-navy text-cream relative container mx-auto max-w-5xl overflow-hidden rounded-[28px] p-8 sm:px-5 lg:px-7">
        <h2 className="text-2xl font-black">از انتخاب نخ تا جعبه کادویی</h2>
        <p className="text-cream/75 mt-3 leading-8">
          گالری ملی‌کیدز در ولیعصر است؛ اما دوخت در کارگاه‌های کوچک ایرانی انجام
          می‌شود.
        </p>
        <p className="text-gold-light mt-4 text-sm">{BRAND.address}</p>
        <Link
          href="/contact"
          className="bg-gold text-navy-deep mt-5 inline-flex rounded-full px-6 py-3 font-black"
        >
          تماس و آدرس کامل
        </Link>
      </section>
    </>
  );
}

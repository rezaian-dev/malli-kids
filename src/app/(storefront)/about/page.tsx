import Link from "next/link";
import { Heart, ScanFace, Scissors, ShieldCheck } from "lucide-react";
import { Intro } from "@/components/shared/intro";
import { ABOUT } from "@/lib/data/pages";
import { BRAND } from "@/lib/constants";

const ICONS = [Heart, Scissors, ScanFace, ShieldCheck];

export default function AboutPage() {
  return (
    <>
      <Intro crumb={ABOUT.crumb} kicker={ABOUT.kicker} title={ABOUT.title} lead={ABOUT.lead} />
      <div className="container mx-auto mb-10 flex max-w-5xl flex-wrap gap-3 px-3 sm:px-5 lg:px-7">
        <Link href="/shop" className="inline-flex rounded-full bg-navy px-6 py-3 font-black text-ivory shadow-lg shadow-navy/20 transition-transform hover:-translate-y-0.5">مشاهده کالکشن</Link>
        <Link href="/tryon" className="inline-flex rounded-full border-2 border-gold px-6 py-3 font-black text-gold transition-transform hover:-translate-y-0.5">پرو مجازی</Link>
      </div>
      <div className="container mx-auto mb-14 grid max-w-5xl grid-cols-2 gap-3 px-3 sm:grid-cols-5 sm:px-5 lg:px-7">
        {ABOUT.stats.map((s) => (
          <div key={s.n} className="lux-card p-4 text-center">
            <p className="text-xl font-black text-navy dark:text-ivory">{s.n}</p>
            <p className="mt-1 text-[11px] leading-5 text-navy/50 dark:text-wheat">{s.l}</p>
          </div>
        ))}
      </div>
      <section className="container mx-auto mb-14 max-w-5xl px-3 sm:px-5 lg:px-7">
        <h2 className="mb-6 text-2xl font-black text-navy dark:text-ivory">از یک کارگاه کوچک تا بوتیک ملی‌کیدز</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {ABOUT.story.map((s) => (
            <article key={s.n} className="lux-card p-5">
              <p className="font-black text-gold">{s.n}</p>
              <h3 className="mt-2 font-black text-navy dark:text-ivory">{s.t}</h3>
              <p className="mt-2 text-sm leading-7 text-navy/55 dark:text-wheat">{s.d}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="container mx-auto mb-14 max-w-5xl px-3 sm:px-5 lg:px-7">
        <h2 className="mb-6 text-2xl font-black text-navy dark:text-ivory">چهار قول به شما</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {ABOUT.promises.map((p, i) => {
            const Icon = ICONS[i] ?? Heart;
            return (
              <article key={p.t} className="lux-card flex gap-4 p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gold/15 text-gold">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-black text-navy dark:text-ivory">{p.t}</h3>
                  <p className="mt-2 text-sm leading-7 text-navy/55 dark:text-wheat">{p.d}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <section className="container relative mx-auto max-w-5xl overflow-hidden rounded-[28px] bg-navy p-8 text-cream sm:px-5 lg:px-7">
        <h2 className="text-2xl font-black">از انتخاب نخ تا جعبهٔ کادویی</h2>
        <p className="mt-3 leading-8 text-cream/75">گالری ملی‌کیدز در ولیعصر است؛ اما دوخت در کارگاه‌های کوچک ایرانی انجام می‌شود.</p>
        <p className="mt-4 text-sm text-gold-light">{BRAND.address}</p>
        <Link href="/contact" className="mt-5 inline-flex rounded-full bg-gold px-6 py-3 font-black text-navy-deep">تماس و آدرس کامل</Link>
      </section>
    </>
  );
}

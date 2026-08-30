import Link from "next/link";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { JsonLd } from "@/components/shared/json-ld";
import { Stagger, StaggerItem } from "@/components/motion/static";
import { pageSchema } from "@/lib/seo";
import { cn } from "@/lib/utils";

// Coming-soon placeholder for /tryon. Pure Server Component, CSS-only
// motion. No studio, API, or client JS — just the teaser.

const STEPS = [
  {
    n: "۱",
    title: "عکس را بگذارید",
    text: "یک عکس تمام‌قد با نور خوب از فرزندتان کافی است.",
    icon: (
      <path d="M4 8h3l2-2.5h6L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
    ),
    lens: <circle cx="12" cy="13.5" r="3.2" />,
  },
  {
    n: "۲",
    title: "لباس را انتخاب کنید",
    text: "هر مدلی از کالکشن فروشگاه که چشم‌تان را گرفته است.",
    icon: (
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23Z" />
    ),
    lens: null,
  },
  {
    n: "۳",
    title: "پرو را ببینید",
    text: "نتیجه با هوش مصنوعی، همراه پیشنهاد سایز دقیق.",
    icon: (
      <path d="M12 3l1.9 5.8 5.8 1.9-5.8 1.9L12 18.4l-1.9-5.8-5.8-1.9 5.8-1.9L12 3Z" />
    ),
    lens: null,
  },
] as const;

function StepIcon({ step }: { step: (typeof STEPS)[number] }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-6"
    >
      {step.icon}
      {step.lens}
    </svg>
  );
}

export function ComingSoon() {
  return (
    <>
      <JsonLd
        data={pageSchema({
          title: "پرو مجازی (به‌زودی)",
          description:
            "اتاق پرو مجازی ملی‌کیدز به‌زودی باز می‌شود: پرو لباس کودک با هوش مصنوعی و پیشنهاد سایز.",
          path: "/tryon",
          type: "WebPage",
        })}
      />

      <div className="xs:px-4 container mx-auto w-full max-w-5xl px-3 sm:px-5 lg:px-7">
        <Breadcrumb
          items={[
            { name: "خانه", path: "/" },
            { name: "پرو مجازی", path: "/tryon" },
          ]}
        />

        <Stagger>
          {/* ── Hero panel ─────────────────────────────── */}
          <StaggerItem>
            <section
              aria-labelledby="tryon-soon-title"
              className={cn(
                "relative overflow-hidden rounded-[28px] border",
                "border-gold/40 bg-navy-deep",
                "shadow-[0_30px_70px_-30px_rgba(4,20,39,.65)]",
              )}
            >
              {/* ambient gold glow */}
              <div
                aria-hidden="true"
                className="bg-gold/25 pointer-events-none absolute inset-s-1/4 -top-32 size-72 rounded-full blur-3xl"
              />
              <div
                aria-hidden="true"
                className="bg-navy-mid pointer-events-none absolute inset-e-1/4 -bottom-40 size-80 rounded-full blur-3xl"
              />

              <div className="relative grid gap-10 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
                {/* copy */}
                <div>
                  <p className="border-gold/50 bg-gold/10 text-gold-soft inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black tracking-wide">
                    <span className="relative flex size-2">
                      <span className="bg-gold-glow absolute inline-flex size-full animate-ping rounded-full opacity-60" />
                      <span className="bg-gold-glow relative inline-flex size-2 rounded-full" />
                    </span>
                    به‌زودی
                    <span
                      aria-hidden="true"
                      className="font-display text-[10px] font-normal tracking-[.25em]"
                    >
                      COMING SOON
                    </span>
                  </p>

                  <h1
                    id="tryon-soon-title"
                    className="text-ivory mt-5 text-3xl leading-snug font-black sm:text-4xl sm:leading-snug"
                  >
                    اتاق پرو مجازی{" "}
                    <span className="text-gold-glow">در راه است</span>
                  </h1>
                  <p className="font-display text-wheat/90 mt-2 text-lg italic">
                    داریم آخرین دوخت‌ها را می‌زنیم…
                  </p>
                  <p className="text-ivory/80 mt-4 max-w-xl text-sm leading-7 sm:text-base sm:leading-8">
                    به‌زودی می‌توانید یک عکس تمام‌قد از فرزندتان بگذارید، هر
                    لباسی از کالکشن را انتخاب کنید و ببینید تنش چطور می‌ایستد —
                    با هوش مصنوعی و پیشنهاد سایز دقیق.
                  </p>

                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <Link
                      href="/shop"
                      className={cn(
                        "group inline-flex items-center gap-2 rounded-2xl px-6 py-3",
                        "bg-gold text-navy-deep text-sm font-black",
                        "shadow-[0_14px_30px_-12px_rgba(193,147,87,.7)]",
                        "hover:bg-gold-soft transition-all hover:shadow-[0_18px_36px_-12px_rgba(193,147,87,.8)]",
                        "focus-visible:ring-gold-glow focus-visible:ring-offset-navy-deep focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                      )}
                    >
                      دیدن کالکشن
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className="size-4 transition-transform group-hover:-translate-x-1"
                      >
                        <path d="M19 12H5m7-7-7 7 7 7" />
                      </svg>
                    </Link>
                    <Link
                      href="/"
                      className={cn(
                        "inline-flex items-center rounded-2xl px-6 py-3 text-sm font-bold",
                        "border-ivory/25 text-ivory border",
                        "hover:border-gold/60 hover:text-gold-soft transition-colors",
                        "focus-visible:ring-gold-glow focus-visible:ring-offset-navy-deep focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                      )}
                    >
                      بازگشت به خانه
                    </Link>
                  </div>
                </div>

                {/* visual: fitting-room mirror (pure CSS/SVG) */}
                <div
                  aria-hidden="true"
                  className="relative mx-auto hidden w-full max-w-65 select-none sm:block"
                >
                  <div className="border-gold/30 absolute inset-6 animate-spin rounded-full border border-dashed animation-duration-[24s]" />
                  <div className="border-gold/40 from-navy-mid via-navy-deep to-navy-deep relative aspect-3/4 overflow-hidden rounded-4xl border bg-linear-to-b shadow-[inset_0_0_60px_rgba(193,147,87,.15)]">
                    {/* light sweep */}
                    <div className="via-ivory/10 absolute inset-y-0 inset-s-1/4 w-1/3 -skew-x-12 animate-pulse bg-linear-to-b from-transparent to-transparent" />
                    {/* hanger */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gold-glow size-16"
                      >
                        <circle cx="12" cy="5" r="2.2" />
                        <path d="M12 7.2V9m0 0-8.5 6.2A1.6 1.6 0 0 0 4.6 18h14.8a1.6 1.6 0 0 0 1.1-2.8L12 9" />
                      </svg>
                      <p className="font-display text-wheat/80 text-xs tracking-[.3em]">
                        FITTING ROOM
                      </p>
                    </div>
                  </div>
                  {/* floating chips */}
                  <div className="border-gold/40 bg-ivory text-navy-deep absolute -inset-e-8 -top-3 animate-bounce rounded-2xl border px-3 py-2 text-[11px] font-black shadow-xl animation-duration-[2.6s]">
                    پیراهن مجلسی
                  </div>
                  <div className="border-gold/40 bg-ivory text-navy-deep absolute -inset-s-10 bottom-8 animate-bounce rounded-2xl border px-3 py-2 text-[11px] font-black shadow-xl [animation-delay:.4s] animation-duration-[3.1s]">
                    سایز پیشنهادی: ۴
                  </div>
                </div>
              </div>
            </section>
          </StaggerItem>

          {/* ── How it will work ───────────────────────── */}
          <StaggerItem>
            <section
              aria-labelledby="tryon-steps-title"
              className="border-gold/30 dark:border-gold/35 dark:bg-slate/50 mt-8 rounded-[28px] border bg-white/90 px-6 py-8 shadow-[0_18px_40px_-28px_rgba(14,42,71,.28)] sm:px-8"
            >
              <h2
                id="tryon-steps-title"
                className="text-navy dark:text-ivory text-center text-lg font-black sm:text-xl"
              >
                قرار است چطور کار کند؟
              </h2>
              <ol className="mt-6 grid gap-4 sm:grid-cols-3">
                {STEPS.map((step) => (
                  <li
                    key={step.n}
                    className={cn(
                      "relative rounded-3xl border p-5 pt-6",
                      "border-gold/25 bg-ivory/60 dark:border-gold/20 dark:bg-navy-deep/40",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="bg-gold text-navy-deep absolute inset-s-5 -top-3.5 flex size-7 items-center justify-center rounded-full text-sm font-black shadow"
                    >
                      {step.n}
                    </span>
                    <span className="text-gold-ink dark:text-gold-glow">
                      <StepIcon step={step} />
                    </span>
                    <h3 className="text-navy dark:text-ivory mt-3 text-sm font-black">
                      {step.title}
                    </h3>
                    <p className="text-navy/70 dark:text-wheat/80 mt-1.5 text-xs leading-6">
                      {step.text}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          </StaggerItem>

          {/* ── Get-ready note ─────────────────────────── */}
          <StaggerItem>
            {/* ♿ navy/70, not /60 — at this text-xs size /60 measured under
                4.5:1 against this section's background (Lighthouse
                color-contrast). /70 matches the passing step text right
                above and clears it. */}
            <p className="text-navy/70 dark:text-wheat/80 mx-auto mt-6 max-w-xl text-center text-xs leading-6">
              💡 از حالا می‌توانید یک عکس تمام‌قد با نور خوب و پس‌زمینهٔ ساده
              آماده کنید — روز افتتاح، اولین پرو فقط چند ثانیه طول می‌کشد.
            </p>
          </StaggerItem>
        </Stagger>
      </div>
    </>
  );
}

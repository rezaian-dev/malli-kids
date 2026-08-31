import { Camera, Ruler, Shirt, Sparkles, Wand2 } from "lucide-react";
import { NotifyForm } from "./try-on-notify-form";

const STEPS = [
  {
    icon: Camera,
    t: "عکس کوچولو",
    d: "یک عکس تمام‌قد آپلود می‌کنید یا از مدل‌های نمونه انتخاب می‌کنید.",
  },
  {
    icon: Shirt,
    t: "انتخاب لباس",
    d: "هر مدلی از کالکشن را که خواستید انتخاب می‌کنید.",
  },
  {
    icon: Ruler,
    t: "پیش‌نمایش و سایز",
    d: "لباس روی تن دیده می‌شود و سایز مناسب پیشنهاد می‌شود.",
  },
];

export function TryOnComingSoon() {
  return (
    <div className="container mx-auto w-full max-w-5xl px-4 pb-10 sm:px-5 lg:px-7">
      {/* Hero */}
      <div className="border-gold/30 from-navy via-navy-mid to-navy-deep text-ivory relative isolate overflow-hidden rounded-4xl border bg-linear-to-b p-8 text-center shadow-[0_30px_80px_-30px_rgba(4,20,39,.6)] sm:p-14">
        {/* decorative glows + shimmer */}
        <span className="animate-floaty bg-gold/20 pointer-events-none absolute -inset-s-16 top-4 size-48 rounded-full blur-3xl motion-reduce:animate-none" />
        <span className="animate-floaty-slow bg-gold-glow/15 pointer-events-none absolute -inset-e-10 -top-8 size-40 rounded-full blur-2xl motion-reduce:animate-none" />
        <span className="animate-shimmer pointer-events-none absolute -inset-x-1/3 inset-y-0 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-white/10 to-transparent motion-reduce:animate-none" />

        <div className="relative">
          <span className="bg-gold/15 text-gold-light ring-gold/40 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black ring-1">
            <Sparkles className="animate-twinkle size-4 motion-reduce:animate-none" />{" "}
            به‌زودی
          </span>

          <div className="bg-gold/15 ring-gold/40 mx-auto mt-6 flex size-20 items-center justify-center rounded-3xl ring-1">
            <Wand2 className="text-gold size-9" />
          </div>

          <h2 className="mt-6 text-[clamp(1.7rem,4vw,2.6rem)] leading-tight font-black">
            پرو مجازی با <span className="text-gold">هوش مصنوعی</span>
          </h2>
          <p className="text-wheat mx-auto mt-3 max-w-xl text-sm leading-8 sm:text-base">
            به‌زودی می‌توانید لباس‌های کالکشن را با هوش مصنوعی روی تنِ کوچولو
            ببینید و سایز مناسب را پیدا کنید. در حال آماده‌سازیِ این تجربه
            هستیم.
          </p>

          {/* notify */}
          <NotifyForm />
        </div>
      </div>

      {/* How it will work */}
      <div className="mt-8">
        <p className="text-gold mb-4 text-center text-xs font-black tracking-[0.24em]">
          این‌طور کار خواهد کرد
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className="border-navy/10 dark:border-gold/25 dark:bg-dusk rounded-3xl border bg-white p-5"
            >
              <div className="bg-gold/15 text-gold flex size-11 items-center justify-center rounded-2xl">
                <s.icon className="size-5" />
              </div>
              <p className="text-navy dark:text-ivory mt-3 font-black">
                <span className="text-gold">{["۱", "۲", "۳"][i]}.</span> {s.t}
              </p>
              <p className="text-navy/55 dark:text-wheat mt-1.5 text-xs leading-6">
                {s.d}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

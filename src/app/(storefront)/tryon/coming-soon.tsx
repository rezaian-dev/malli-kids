"use client";

import { useState } from "react";
import { ArrowLeft, Camera, Ruler, Shirt, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  { icon: Camera, t: "عکس کوچولو", d: "یک عکس تمام‌قد آپلود می‌کنید یا از مدل‌های نمونه انتخاب می‌کنید." },
  { icon: Shirt, t: "انتخاب لباس", d: "هر مدلی از کالکشن را که خواستید انتخاب می‌کنید." },
  { icon: Ruler, t: "پیش‌نمایش و سایز", d: "لباس روی تن دیده می‌شود و سایز مناسب پیشنهاد می‌شود." },
];

export function TryOnComingSoon() {
  const [email, setEmail] = useState("");

  function notify(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return toast("ایمیل معتبر وارد کنید");
    setEmail("");
    toast("ثبت شد ✨ به‌محض آماده شدن، خبرتان می‌کنیم");
  }

  return (
    <div className="container mx-auto w-full max-w-5xl px-4 pb-10 sm:px-5 lg:px-7">
      {/* Hero */}
      <div className="relative isolate overflow-hidden rounded-[32px] border border-gold/30 bg-linear-to-b from-navy via-navy-mid to-navy-deep p-8 text-center text-ivory shadow-[0_30px_80px_-30px_rgba(4,20,39,.6)] sm:p-14">
        {/* decorative glows + shimmer */}
        <span className="animate-floaty motion-reduce:animate-none pointer-events-none absolute -start-16 top-4 size-48 rounded-full bg-gold/20 blur-3xl" />
        <span className="animate-floaty-slow motion-reduce:animate-none pointer-events-none absolute -end-10 -top-8 size-40 rounded-full bg-gold-glow/15 blur-2xl" />
        <span className="animate-shimmer motion-reduce:animate-none pointer-events-none absolute inset-y-0 -inset-x-1/3 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 text-xs font-black text-gold-light ring-1 ring-gold/40">
            <Sparkles className="animate-twinkle motion-reduce:animate-none size-4" /> به‌زودی
          </span>

          <div className="mx-auto mt-6 flex size-20 items-center justify-center rounded-3xl bg-gold/15 ring-1 ring-gold/40">
            <Wand2 className="size-9 text-gold" />
          </div>

          <h2 className="mt-6 font-display text-[clamp(1.7rem,4vw,2.6rem)] font-bold tracking-tight">
            پرو مجازی با <span className="text-gold">هوش مصنوعی</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-8 text-wheat sm:text-base">
            به‌زودی می‌توانید لباس‌های کالکشن را با هوش مصنوعی روی تنِ کوچولو ببینید و سایز مناسب را پیدا کنید. در حال آماده‌سازیِ این تجربه هستیم.
          </p>

          {/* notify */}
          <form onSubmit={notify} className="mx-auto mt-7 flex w-full max-w-md items-center gap-1.5 rounded-full border border-white/20 bg-white/5 p-1.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ایمیل شما برای اطلاع‌رسانی…"
              className="h-10 min-w-0 flex-1 rounded-full bg-transparent px-4 text-sm text-cream outline-none placeholder:text-taupe"
            />
            <button type="submit" className="group inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-gold px-4 text-xs font-black text-navy-deep transition hover:scale-[1.03]">
              خبرم کن <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            </button>
          </form>
        </div>
      </div>

      {/* How it will work */}
      <div className="mt-8">
        <p className="mb-4 text-center text-xs font-black tracking-[0.24em] text-gold">این‌طور کار خواهد کرد</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={i} className="rounded-3xl border border-navy/10 bg-white p-5 dark:border-gold/25 dark:bg-dusk">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-gold/15 text-gold">
                <s.icon className="size-5" />
              </div>
              <p className="mt-3 font-black text-navy dark:text-ivory">
                <span className="text-gold">{["۱", "۲", "۳"][i]}.</span> {s.t}
              </p>
              <p className="mt-1.5 text-xs leading-6 text-navy/55 dark:text-wheat">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

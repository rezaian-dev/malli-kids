"use client";

import { ArrowLeft, Camera, Ruler, Shirt, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { AppForm, Field, useAppForm } from "@/components/form";
import { notifyDefaults, notifySchema, type NotifyValues } from "@/lib/forms";
import { cn } from "@/lib/utils";

const STEPS = [
  { icon: Camera, t: "عکس کوچولو", d: "یک عکس تمام‌قد آپلود می‌کنید یا از مدل‌های نمونه انتخاب می‌کنید." },
  { icon: Shirt, t: "انتخاب لباس", d: "هر مدلی از کالکشن را که خواستید انتخاب می‌کنید." },
  { icon: Ruler, t: "پیش‌نمایش و سایز", d: "لباس روی تن دیده می‌شود و سایز مناسب پیشنهاد می‌شود." },
];

export function TryOnComingSoon() {
  const form = useAppForm({ schema: notifySchema, defaultValues: notifyDefaults });

  function notify({ email }: NotifyValues) {
    // TODO: عضویتِ «خبرم کن» را به سرویسِ پیامک/ایمیل وصل کنید.
    toast.success(`ثبت شد ✨ به‌محض آماده شدن، به ${email} خبر می‌دهیم`);
    form.reset();
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
          <AppForm form={form} onSubmit={notify} ariaLabel="خبرم کن" className="mx-auto mt-7 w-full max-w-md" notify>
            <Field name="email" label="ایمیل شما برای اطلاع‌رسانی" labelClassName="sr-only" skin="inset" noShell>
              {({ field, invalid, id, describedBy }) => (
                <span
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border bg-white/5 p-1.5 transition-colors",
                    invalid ? "border-rose" : "border-white/20 focus-within:border-gold/60",
                  )}
                >
                  <input
                    id={id}
                    type="email"
                    dir="ltr"
                    autoComplete="email"
                    placeholder="ایمیل شما…"
                    aria-invalid={invalid || undefined}
                    aria-describedby={describedBy}
                    value={(field.value as string) ?? ""}
                    name={field.name}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    className="h-10 min-w-0 flex-1 rounded-full bg-transparent px-4 text-right text-sm text-cream outline-none placeholder:text-taupe"
                  />
                  <button type="submit" className="group inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-gold px-4 text-xs font-black text-navy-deep transition hover:scale-[1.03]">
                    خبرم کن <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
                  </button>
                </span>
              )}
            </Field>
          </AppForm>
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

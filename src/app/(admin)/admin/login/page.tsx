"use client";

import Image from "next/image";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, ShieldCheck, Sparkles, User } from "lucide-react";
import { useAdmin } from "@/components/admin";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { AppForm, TextField, useAppForm } from "@/components/form";
import { adminLoginDefaults, adminLoginSchema, type AdminLoginValues } from "./_lib/login-schema";

export default function AdminLogin() {
  const { login } = useAdmin();
  const router = useRouter();
  const [shake, setShake] = useState(0);
  const form = useAppForm({ schema: adminLoginSchema, defaultValues: adminLoginDefaults });
  const err = form.formState.errors.root?.message;

  function onSubmit({ user, pass }: AdminLoginValues) {
    if (!login(user.trim(), pass)) {
      // خطایِ سمتِ سرور: رویِ ریشهٔ فرم می‌نشیند و فرم را می‌لرزاند
      form.setError("root", { message: "نام کاربری یا رمز نادرست است" });
      setShake((n) => n + 1);
      return;
    }
    form.clearErrors("root");
    router.replace("/admin");
  }

  return (
    <div className="grid min-h-dvh text-navy bg-fog bg-[radial-gradient(52%_38%_at_100%_0%,rgba(193,147,87,0.15),transparent_68%),radial-gradient(42%_34%_at_0%_100%,rgba(14,42,71,0.08),transparent_72%),linear-gradient(rgba(14,42,71,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(14,42,71,0.022)_1px,transparent_1px)] bg-[size:auto,auto,36px_36px,36px_36px] dark:text-ivory dark:bg-[#03111f] dark:bg-[radial-gradient(58%_44%_at_103%_-4%,rgba(193,147,87,0.18),transparent_68%),radial-gradient(45%_38%_at_-5%_105%,rgba(44,86,128,0.34),transparent_72%),linear-gradient(rgba(232,197,122,0.027)_1px,transparent_1px),linear-gradient(90deg,rgba(232,197,122,0.027)_1px,transparent_1px)] dark:bg-[size:auto,auto,42px_42px,42px_42px] lg:grid-cols-[minmax(0,1fr)_minmax(20rem,42%)]">
      {/* الگوی هندسیِ admin-root::before — جانشین pseudo-element */}
      <span
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-no-repeat opacity-[0.22] bg-[position:calc(100%+45px)_-45px] bg-[size:min(44vw,38rem)] [mask-image:linear-gradient(to_bottom_left,#000,transparent_64%)] max-[639px]:bg-[size:20rem] max-[639px]:opacity-[0.14] dark:opacity-[0.52] dark:[filter:drop-shadow(0_0_22px_rgba(193,147,87,0.08))]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'180\' height=\'180\' viewBox=\'0 0 180 180\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' stroke=\'%23c19357\' stroke-opacity=\'.28\'%3E%3Ccircle cx=\'90\' cy=\'90\' r=\'42\'/%3E%3Ccircle cx=\'90\' cy=\'90\' r=\'28\' stroke-dasharray=\'3 7\'/%3E%3Cpath d=\'M90 34v112M34 90h112M50 50l80 80M130 50l-80 80\' stroke-opacity=\'.15\'/%3E%3C/g%3E%3C/svg%3E")',
        }}
      />
      <section className="relative flex flex-col justify-between px-6 py-8 sm:px-10 lg:px-16 lg:py-12">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/brand/logo-white.png" alt="" width={44} height={44} className="size-11 rounded-2xl bg-navy p-1.5 object-contain dark:bg-transparent dark:p-0" />
            <div className="leading-none">
              <p className="font-display text-sm font-bold tracking-[0.2em] text-navy dark:text-ivory">MALLI</p>
              <p className="mt-1 text-[10px] font-black tracking-[0.32em] text-gold">CONSOLE</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle className="size-10 rounded-full border border-navy/12 bg-white text-navy hover:border-gold/50 dark:border-gold/25 dark:bg-navy-mid dark:text-gold-soft" />
            <Link href="/" className="inline-flex min-h-11 items-center text-xs font-black text-navy/50 hover:text-gold dark:text-ivory/45">
              بازگشت به فروشگاه
            </Link>
          </div>
        </header>

        <div className="mx-auto w-full max-w-md py-12 lg:mx-0">
          <p className="text-[11px] font-black tracking-[0.22em] text-gold">ATELIER ACCESS</p>
          <h1 className="mt-3 text-[clamp(1.7rem,4vw,2.6rem)] font-black leading-tight text-navy dark:text-ivory">
            ورود تیم
            <span className="text-gold"> گالری</span>
          </h1>
          <p className="mt-3 text-sm leading-7 text-navy/55 dark:text-wheat">
            پنل سفارش، موجودی و مجله — فقط برای همکاران ملی‌کیدز.
          </p>

          <AppForm
            form={form}
            onSubmit={onSubmit}
            ariaLabel="ورود به پنل مدیریت"
            shakeSignal={shake}
            className="mt-9 space-y-6"
          >
            {err ? (
              <p role="alert" className="text-sm font-bold text-rose">
                {err}
              </p>
            ) : null}

            <TextField
              name="user"
              label="شناسه"
              icon={<User className="size-4" />}
              placeholder="شناسه همکار"
              autoComplete="username"
              skin="bare"
              required
            />
            <TextField
              name="pass"
              label="کلید دسترسی"
              icon={<Lock className="size-4" />}
              type="password"
              placeholder="رمز اختصاصی پنل"
              autoComplete="current-password"
              skin="bare"
              required
            />

            <button type="submit" className="group flex h-14 w-full items-center justify-between rounded-full bg-navy px-6 text-sm font-black text-ivory shadow-[0_16px_32px_-16px_rgba(14,42,71,.55)] transition hover:bg-navy-mid dark:bg-gold dark:text-navy-deep dark:hover:bg-gold-light">
              ورود به کنسول
              <span className="grid size-9 place-items-center rounded-full bg-navy-deep text-gold transition-transform group-hover:-translate-x-1 dark:bg-navy-deep/30 dark:text-navy-deep">
                <ArrowLeft className="size-4" />
              </span>
            </button>
          </AppForm>
        </div>

        <ul className="grid max-w-md grid-cols-3 gap-3 text-[11px] font-bold text-navy/60 dark:text-wheat">
          <li className="rounded-[22px] max-[639px]:rounded-[19px] border border-navy/9 bg-paper/94 shadow-[0_20px_48px_-34px_rgba(14,42,71,0.38),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[18px] transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:border-gold/40 hover:shadow-[0_24px_52px_-34px_rgba(14,42,71,0.44)] dark:border-gold-soft/16 dark:bg-[rgba(16,43,70,0.72)] dark:shadow-[0_25px_60px_-35px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,0.045),0_0_0_1px_rgba(193,147,87,0.025)] dark:hover:border-gold-soft/30 dark:hover:shadow-[0_28px_64px_-36px_rgba(0,0,0,0.88),0_0_34px_rgba(193,147,87,0.035)] px-3 py-3">
            <ShieldCheck className="mb-1 size-4 text-gold" /> دسترسی محدود
          </li>
          <li className="rounded-[22px] max-[639px]:rounded-[19px] border border-navy/9 bg-paper/94 shadow-[0_20px_48px_-34px_rgba(14,42,71,0.38),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[18px] transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:border-gold/40 hover:shadow-[0_24px_52px_-34px_rgba(14,42,71,0.44)] dark:border-gold-soft/16 dark:bg-[rgba(16,43,70,0.72)] dark:shadow-[0_25px_60px_-35px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,0.045),0_0_0_1px_rgba(193,147,87,0.025)] dark:hover:border-gold-soft/30 dark:hover:shadow-[0_28px_64px_-36px_rgba(0,0,0,0.88),0_0_34px_rgba(193,147,87,0.035)] px-3 py-3">
            <Sparkles className="mb-1 size-4 text-gold" /> سفارش لحظه‌ای
          </li>
          <li className="rounded-[22px] max-[639px]:rounded-[19px] border border-navy/9 bg-paper/94 shadow-[0_20px_48px_-34px_rgba(14,42,71,0.38),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[18px] transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:border-gold/40 hover:shadow-[0_24px_52px_-34px_rgba(14,42,71,0.44)] dark:border-gold-soft/16 dark:bg-[rgba(16,43,70,0.72)] dark:shadow-[0_25px_60px_-35px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,0.045),0_0_0_1px_rgba(193,147,87,0.025)] dark:hover:border-gold-soft/30 dark:hover:shadow-[0_28px_64px_-36px_rgba(0,0,0,0.88),0_0_34px_rgba(193,147,87,0.035)] px-3 py-3">
            <Lock className="mb-1 size-4 text-gold" /> نشست امن
          </li>
        </ul>
      </section>

      {/* Image panel — intentionally rich in both themes */}
      <aside className="relative hidden min-h-[18rem] overflow-hidden bg-navy lg:block">
        <Image src="/brand/hero-dress.jpg" alt="" width={900} height={1200} priority className="absolute inset-0 size-full object-cover object-[center_15%]" />
        <div className="absolute inset-0 bg-linear-to-t from-navy-deep via-navy-deep/35 to-transparent" />
        <div className="absolute inset-5 rounded-[28px] border border-gold/40" />
        <div className="absolute inset-x-10 bottom-10 text-ivory">
          <p className="font-display text-xs tracking-[0.35em] text-gold-light">MALLI KIDS</p>
          <p className="mt-3 max-w-xs text-2xl font-black leading-snug">هر دوخت، یک سفارش دقیق در گالری.</p>
        </div>
      </aside>
    </div>
  );
}

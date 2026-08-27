"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, ShieldCheck, Sparkles, User } from "lucide-react";
import { useAdmin } from "@/features/admin";
import { ModeToggle } from "@/components/shared/mode-toggle";

export default function AdminLogin() {
  const { login } = useAdmin();
  const router = useRouter();
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(0);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const ok = login(String(fd.get("user") || ""), String(fd.get("pass") || ""));
    if (!ok) {
      setErr("نام کاربری یا رمز نادرست است");
      setShake((n) => n + 1);
      return;
    }
    router.replace("/admin");
  }

  return (
    <div className="admin-root grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(20rem,42%)]">
      <section className="relative flex flex-col justify-between px-6 py-8 sm:px-10 lg:px-16 lg:py-12">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/brand/logo-white.png" alt="" className="size-11 rounded-2xl bg-navy p-1.5 object-contain dark:bg-transparent dark:p-0" />
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
          <p className="lux-kicker">ATELIER ACCESS</p>
          <h1 className="mt-3 text-[clamp(1.7rem,4vw,2.6rem)] font-black leading-tight text-navy dark:text-ivory">
            ورود تیم
            <span className="text-gold"> گالری</span>
          </h1>
          <p className="mt-3 text-sm leading-7 text-navy/55 dark:text-wheat">
            پنل سفارش، موجودی و مجله — فقط برای همکاران ملی‌کیدز.
          </p>

          <form key={shake} onSubmit={onSubmit} className={`mt-9 space-y-6 ${err ? "animate-shake" : ""}`} noValidate>
            {err ? <p className="text-sm font-bold text-rose">{err}</p> : null}
            <label className="block">
              <span className="text-[11px] font-black tracking-[0.16em] text-gold">شناسه</span>
              <span className={`mt-2 flex items-center gap-3 border-b-2 pb-2 ${err ? "border-rose" : "border-navy/15 focus-within:border-gold dark:border-gold/25"}`}>
                <User className="size-4 text-gold" />
                <input name="user" autoComplete="username" placeholder="شناسه همکار" className="h-11 w-full bg-transparent text-base font-bold text-navy outline-none placeholder:text-navy/30 dark:text-ivory dark:placeholder:text-ivory/30" />
              </span>
            </label>
            <label className="block">
              <span className="text-[11px] font-black tracking-[0.16em] text-gold">کلید دسترسی</span>
              <span className={`mt-2 flex items-center gap-3 border-b-2 pb-2 ${err ? "border-rose" : "border-navy/15 focus-within:border-gold dark:border-gold/25"}`}>
                <Lock className="size-4 text-gold" />
                <input name="pass" type="password" autoComplete="current-password" placeholder="رمز اختصاصی پنل" className="h-11 w-full bg-transparent text-base font-bold text-navy outline-none placeholder:text-navy/30 dark:text-ivory dark:placeholder:text-ivory/30" />
              </span>
            </label>
            <button type="submit" className="group flex h-14 w-full items-center justify-between rounded-full bg-navy px-6 text-sm font-black text-ivory shadow-[0_16px_32px_-16px_rgba(14,42,71,.55)] transition hover:bg-navy-mid dark:bg-gold dark:text-navy-deep dark:hover:bg-gold-light">
              ورود به کنسول
              <span className="grid size-9 place-items-center rounded-full bg-navy-deep text-gold transition-transform group-hover:-translate-x-1 dark:bg-navy-deep/30 dark:text-navy-deep">
                <ArrowLeft className="size-4" />
              </span>
            </button>
          </form>
        </div>

        <ul className="grid max-w-md grid-cols-3 gap-3 text-[11px] font-bold text-navy/60 dark:text-wheat">
          <li className="admin-card px-3 py-3">
            <ShieldCheck className="mb-1 size-4 text-gold" /> دسترسی محدود
          </li>
          <li className="admin-card px-3 py-3">
            <Sparkles className="mb-1 size-4 text-gold" /> سفارش لحظه‌ای
          </li>
          <li className="admin-card px-3 py-3">
            <Lock className="mb-1 size-4 text-gold" /> نشست امن
          </li>
        </ul>
      </section>

      {/* Image panel — intentionally rich in both themes */}
      <aside className="relative hidden min-h-[18rem] overflow-hidden bg-navy lg:block">
        <img src="/brand/hero-dress.jpg" alt="" className="absolute inset-0 size-full object-cover object-[center_15%]" />
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

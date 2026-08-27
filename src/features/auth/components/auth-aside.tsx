import type { ReactNode } from "react";
import { Percent, ScanFace, Sparkles, Star } from "lucide-react";

function Perk({ icon, t, d }: { icon: ReactNode; t: string; d: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-gold-light">
        {icon}
      </span>
      <div>
        <p className="text-sm font-bold text-white">{t}</p>
        <p className="mt-0.5 text-[11px] text-ivory/50">{d}</p>
      </div>
    </li>
  );
}

/** ستون تصویری دیالوگ ورود — کاملاً ایستا، پس Server Component. */
export function AuthAside() {
  return (
    <aside className="relative hidden w-[46%] shrink-0 overflow-hidden rounded-s-[28px] bg-navy text-ivory lg:block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/hero-dress.jpg" alt="" className="absolute inset-0 size-full object-cover object-[center_18%]" />
      <div className="absolute inset-0 bg-linear-to-t from-navy-deep via-navy-deep/55 to-transparent" />
      <div className="pointer-events-none absolute inset-3 rounded-[22px] border border-gold/45" />

      <div className="relative flex h-full min-h-0 flex-col justify-between p-7 pe-8">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-white.png" alt="" className="h-11 w-auto drop-shadow-md" />
          <div className="leading-none">
            <span className="font-display block text-sm font-bold tracking-[0.2em] text-white">MALLI</span>
            <span className="font-display mt-1 block text-[10px] tracking-[0.38em] text-gold-light">KIDS</span>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-black tracking-[0.22em] text-gold-light">ATELIER</p>
          <h2 className="mt-2 text-[clamp(1.25rem,2.2vw,1.65rem)] font-black leading-snug">
            دنیای شیکِ
            <br />
            <span className="text-gold-light">کوچولوها</span>
          </h2>
          <p className="mt-3 max-w-[15rem] text-sm leading-7 text-ivory/90">عضویت یعنی ۱۰٪ تخفیف، پرو مجازی و سایز دقیق.</p>

          <ul className="mt-5 space-y-2">
            <Perk icon={<Percent className="size-4" />} t="۱۰٪ تخفیف اولین خرید" d="همان لحظهٔ عضویت" />
            <Perk icon={<Sparkles className="size-4" />} t="پرو مجازی با AI" d="لباس را روی تن ببینید" />
            <Perk icon={<ScanFace className="size-4" />} t="ورود با پیامک" d="ورود سریع بدون رمز عبور" />
          </ul>

          <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-navy-deep/80 px-3.5 py-2 text-xs font-bold text-ivory ring-1 ring-gold/40">
            <Star className="size-3.5 fill-gold text-gold" />
            <span>
              <span className="font-black text-gold-light">+۱۲٬۰۰۰ مادر</span> همراه ما
            </span>
          </p>
        </div>
      </div>
    </aside>
  );
}

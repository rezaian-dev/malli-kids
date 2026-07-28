import Image from "next/image";
import type { ReactNode } from "react";
import { Percent, ShieldCheck, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

function Perk({ icon, t, d }: { icon: ReactNode; t: string; d: string }) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl border",
          "text-gold-light border-white/15 bg-white/10",
        )}
      >
        {icon}
      </span>
      <div>
        <p className="text-sm font-bold text-white">{t}</p>
        <p className="text-ivory/50 mt-0.5 text-[11px]">{d}</p>
      </div>
    </li>
  );
}

export function AuthAside() {
  return (
    <aside
      className={cn(
        "relative hidden w-[46%] shrink-0 overflow-hidden rounded-s-[28px] lg:block",
        "bg-navy text-ivory",
      )}
    >
      <Image
        src="/brand/auth-aside.jpg"
        alt=""
        fill
        sizes="46vw"
        className="absolute inset-0 size-full object-cover object-[center_18%]"
      />
      <div
        className={cn(
          "absolute inset-0",
          "from-navy-deep via-navy-deep/55 bg-linear-to-t to-transparent",
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-3 rounded-[22px] border",
          "border-gold/45",
        )}
      />

      <div className="relative flex h-full min-h-0 flex-col justify-between p-7 pe-8">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/logo-white.png"
            alt=""
            width={44}
            height={44}
            className="size-11 object-contain drop-shadow-md"
          />
          <div className="leading-none">
            <span className="font-display block text-sm font-bold tracking-[0.2em] text-white">
              MALLI
            </span>
            <span
              className={cn(
                "font-display mt-1 block text-[10px] tracking-[0.38em]",
                "text-gold-light",
              )}
            >
              KIDS
            </span>
          </div>
        </div>

        <div>
          <p className="text-gold-light text-[11px] font-black tracking-[0.22em]">
            ATELIER
          </p>
          <h2 className="mt-2 text-[clamp(1.25rem,2.2vw,1.65rem)] leading-snug font-black">
            دنیای شیکِ
            <br />
            <span className="text-gold-light">کوچولوها</span>
          </h2>
          <p className="text-ivory/90 mt-3 max-w-60 text-sm leading-7">
            عضویت یعنی ۱۰٪ تخفیف، پرو مجازی و سایز دقیق.
          </p>

          <ul className="mt-5 space-y-2">
            <Perk
              icon={<Percent className="size-4" />}
              t="۱۰٪ تخفیف اولین خرید"
              d="همان لحظهٔ عضویت"
            />
            <Perk
              icon={<Sparkles className="size-4" />}
              t="پرو مجازی با AI"
              d="لباس را روی تن ببینید"
            />
            <Perk
              icon={<ShieldCheck className="size-4" />}
              t="حسابِ امن"
              d="رمزنگاریِ استاندارد صنعتی"
            />
          </ul>

          <p
            className={cn(
              "mt-5 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold ring-1",
              "bg-navy-deep/80 text-ivory ring-gold/40",
            )}
          >
            <Star className="fill-gold text-gold size-3.5" />
            <span>
              <span className="text-gold-light font-black">+۱۲٬۰۰۰ مادر</span>{" "}
              همراه ما
            </span>
          </p>
        </div>
      </div>
    </aside>
  );
}

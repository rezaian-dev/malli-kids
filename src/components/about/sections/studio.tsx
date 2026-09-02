import Image from "next/image";
import {
  BadgeCheck,
  Boxes,
  Camera,
  Headset,
  Heart,
  PenTool,
  Scissors,
  Sparkles,
} from "lucide-react";
import { ABOUT } from "@/lib/data/pages";
import { cn } from "@/lib/utils";

const ROLE_ICONS = [PenTool, Scissors, Boxes, BadgeCheck, Camera, Headset];

export function Studio() {
  const { studio } = ABOUT;

  return (
    <section className="relative container mx-auto mb-16 max-w-5xl px-3 sm:px-5 lg:px-7">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden dark:hidden">
        <div className="animate-silk-glow bg-gold/20 absolute -top-10 -inset-s-10 size-64 rounded-full blur-[60px]" />
        <div className="bg-navy/10 absolute -bottom-14 -inset-e-14 size-72 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-2xl text-center">
        <p className="text-brown-mid dark:text-gold text-[11px] font-black tracking-[0.22em]">
          {studio.kicker}
        </p>
        <h2 className="text-navy dark:text-ivory mt-2 text-[clamp(1.4rem,3.4vw,2rem)] leading-snug font-black">
          {studio.title}
        </h2>
        <span
          className="from-gold mx-auto mt-4 block h-px w-16 bg-linear-to-l to-transparent"
          aria-hidden
        />
      </div>

      {/* 🖼️ Real asset is 1280×853 (≈3:2) — the frame keeps that exact
          ratio so the studio photo never letterboxes or gets stretched,
          and simply grows/shrinks with the container across breakpoints. */}
      <div className="group/studio relative mx-auto mt-8 w-full sm:mt-10">
        <div
          className={cn(
            "relative aspect-[1280/853] overflow-hidden rounded-[32px] border-6 sm:border-10",
            "bg-sand shadow-navy/20 border-white shadow-2xl",
            "dark:border-linen",
          )}
        >
          <Image
            src="/brand/studio-team.jpg"
            alt="تیم طراحی و دوخت ملی‌کیدز در آتلیه"
            fill
            priority={false}
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 90vw, 960px"
            className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover/studio:scale-105"
          />
          <div
            className={cn(
              "animate-shimmer pointer-events-none absolute inset-0",
              "bg-[linear-gradient(115deg,transparent_32%,rgba(255,255,255,.32)_48%,transparent_62%)]",
            )}
            aria-hidden
          />
          <div className="from-navy/25 absolute inset-0 bg-linear-to-t via-transparent to-transparent" />
        </div>
        <div
          className={cn(
            "animate-orn-sway pointer-events-none absolute -inset-3 -z-10 rounded-[38px] border-2 border-dashed sm:-inset-4",
            "border-gold/50",
          )}
        />
        <div
          className={cn(
            "animate-floaty absolute -top-4 -inset-s-2 flex max-w-46 items-center gap-2 rounded-2xl p-3 shadow-xl sm:-top-6 sm:-inset-s-6",
            "shadow-navy/15 bg-white",
          )}
        >
          <span className="bg-gold/15 text-gold flex size-9 shrink-0 items-center justify-center rounded-xl">
            <Heart className="size-4" />
          </span>
          <div className="min-w-0 text-right">
            <p className="text-navy text-[11px] font-black">طراحی با عشق</p>
            <p className="text-navy/70 mt-0.5 text-[10px] leading-4">
              هر مدل، یک قصه
            </p>
          </div>
        </div>
        <div
          className={cn(
            "animate-floaty-slow absolute -bottom-4 -inset-e-2 rounded-2xl px-4 py-3 shadow-xl sm:-bottom-6 sm:-inset-e-6",
            "bg-navy text-cream shadow-navy/30",
          )}
        >
          <div className="flex items-center gap-1.5">
            <Scissors className="text-gold size-4" />
            <span className="text-xs font-bold">دوخت دستی ایرانی</span>
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-6 sm:mt-16 lg:grid-cols-2 lg:gap-x-10">
        {studio.paragraphs.map((p, i) => (
          <p
            key={i}
            className="text-navy/70 dark:text-wheat text-sm leading-8 sm:text-[15px]"
          >
            {p}
          </p>
        ))}
      </div>

      <ul className="mt-8 flex flex-wrap justify-center gap-2">
        {studio.roles.map((role, i) => {
          const Icon = ROLE_ICONS[i] ?? Sparkles;
          return (
            <li
              key={role}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition-colors duration-300",
                "border-gold/30 bg-white/80 text-navy hover:border-gold/60",
                "dark:border-gold/25 dark:bg-slate/50 dark:text-ivory",
              )}
            >
              <Icon className="text-gold size-3.5 shrink-0" />
              {role}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

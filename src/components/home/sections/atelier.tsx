import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Box, GraduationCap, Package, Scissors } from "lucide-react";
import { OrnStitch } from "@/components/home/home-ornaments";

const CARDS = [
  {
    href: "/patterns",
    Icon: Scissors,
    tag: "PDF + کاغذی",
    t: "الگوهای آماده",
    d: "بیش از ۲۰۰ الگوی استاندارد کودک، از نوزادی تا ۱۲ سال",
  },
  {
    href: "/fabrics",
    Icon: Box,
    tag: "ارگانیک",
    t: "پارچه مدل‌ها",
    d: "کتان، لینن، مخمل و تور؛ متری با ضمانت کیفیت",
    shift: true,
  },
  {
    href: "/tutorials",
    Icon: GraduationCap,
    tag: "رایگان",
    t: "آموزش دوخت",
    d: "ویدیوهای قدم‌به‌قدم برای مادران خوش‌سلیقه",
  },
  {
    href: "/kits",
    Icon: Package,
    tag: "پرفروش",
    t: "کیت دوخت خانگی",
    d: "الگو + پارچه + نخ و دکمه، همه در یک جعبه",
    shift: true,
  },
];

export function Atelier() {
  return (
    <section
      id="atelier"
      className="relative overflow-hidden bg-transparent py-12 sm:py-16 lg:py-20"
    >
      <span className="font-display pointer-events-none absolute top-10 left-8 hidden -rotate-6 text-[120px] leading-none text-transparent select-none [-webkit-text-stroke:1.5px_rgba(193,147,87,.55)] xl:block">
        atelier
      </span>
      <div className="container mx-auto grid w-full items-center gap-16 px-4 sm:gap-14 sm:px-5 lg:grid-cols-2 lg:gap-10 lg:px-7">
        <div className="relative order-2 h-90 transition-all duration-700 ease-out min-[420px]:h-105 sm:h-135 lg:order-1">
          <div className="shadow-navy/20 absolute top-0 right-0 w-[78%] rotate-2 overflow-hidden rounded-2xl shadow-2xl sm:rounded-[28px]">
            <Image
              src="/brand/look-knit-portrait.jpg"
              alt="پارچه‌های آتلیه ملی‌کیدز"
              width={768}
              height={1152}
              className="h-56 w-full object-cover object-center min-[420px]:h-64 sm:h-90"
            />
          </div>
          <div className="shadow-navy/25 absolute bottom-0 left-0 z-10 w-[52%] -rotate-3 overflow-hidden rounded-xl border-4 border-white shadow-2xl sm:rounded-3xl sm:border-8">
            <Image
              src="/brand/cat-girl-portrait.jpg"
              alt="مدل دوخته‌شده با الگوی آماده"
              width={922}
              height={1152}
              className="h-44 w-full object-cover object-top min-[420px]:h-52 sm:h-75"
            />
          </div>
          <div className="animate-floaty absolute top-4 left-1 z-20 h-20 w-20 rotate-6 overflow-hidden rounded-xl border-4 border-white shadow-xl min-[420px]:h-24 min-[420px]:w-24 sm:top-6 sm:left-8 sm:h-28 sm:w-28 sm:rounded-2xl">
            <Image
              src="/brand/look-knit-portrait.jpg"
              alt="نمونه بافت"
              width={768}
              height={1152}
              sizes="(max-width: 639px) 5rem, 7rem"
              className="h-full w-full object-cover object-top"
            />
          </div>
          <div className="bg-navy text-cream absolute right-4 -bottom-1 z-20 flex items-center gap-2 rounded-xl px-4 py-2.5 shadow-xl sm:right-12 sm:-bottom-2 sm:rounded-2xl sm:px-5 sm:py-3">
            <Scissors className="text-gold h-4 w-4 shrink-0" />
            <span className="text-xs font-bold whitespace-nowrap sm:text-sm">
              +۲۰۰ الگوی اختصاصی
            </span>
          </div>
        </div>
        <div className="order-1 transition-all duration-700 ease-out lg:order-2">
          <span className="text-gold text-sm font-bold tracking-wide">
            آتلیه ملی‌کیدز
          </span>
          <h2 className="text-navy dark:text-ivory mt-2 text-[clamp(1.5rem,5.5vw,2.625rem)] leading-snug font-black">
            الگوی آماده و{" "}
            <span className="text-gold relative inline-block">
              پارچه‌ مدل‌ها
              <OrnStitch className="absolute right-0 -bottom-2 w-16" />
            </span>
          </h2>
          <p className="text-navy/60 dark:text-wheat mt-4 text-sm leading-7 sm:mt-5 sm:text-base sm:leading-8">
            دوست دارید خودتان بدوزید؟ الگوی دقیق هر مدل را همراه با پارچه اصل
            همان کالکشن دریافت کنید و اثر ماندگار خودتان را بسازید.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-3.5 min-[480px]:grid-cols-2 sm:mt-9 sm:gap-4">
            {CARDS.map((card) => (
              <Link
                key={card.t}
                href={card.href}
                prefetch={false}
                className={`group border-navy/5 hover:border-gold/50 hover:shadow-gold/10 dark:border-gold/25 dark:bg-slate/55 relative rounded-2xl border bg-white/92 p-5 transition-all hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl sm:p-6 ${card.shift ? "min-[480px]:translate-y-5" : ""}`}
              >
                <span className="bg-gold/15 text-gold absolute top-4 left-4 rounded-full px-2.5 py-1 text-[10px] font-black sm:top-5 sm:left-5">
                  {card.tag}
                </span>
                <span className="bg-navy/5 group-hover:bg-gold/15 flex h-11 w-11 items-center justify-center rounded-xl transition-colors sm:h-12 sm:w-12 sm:rounded-2xl">
                  <card.Icon className="text-navy group-hover:text-gold dark:text-ivory h-5 w-5 transition-colors sm:h-6 sm:w-6" />
                </span>
                <h3 className="text-navy dark:text-ivory mt-3.5 text-base font-black sm:mt-4 sm:text-lg">
                  {card.t}
                </h3>
                <p className="text-navy/55 dark:text-wheat mt-1.5 text-xs leading-6 sm:mt-2 sm:text-sm">
                  {card.d}
                </p>
              </Link>
            ))}
          </div>
          <Link
            href="/about"
            prefetch={false}
            className="border-gold text-navy hover:text-gold dark:text-ivory mt-10 inline-flex min-h-11 items-center gap-2 border-b-2 pb-1 text-sm font-black transition-colors min-[480px]:mt-14 sm:text-base"
          >
            ورود به آتلیه
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

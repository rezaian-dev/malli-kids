import Image from "next/image";
import { ArrowLeft, Box, GraduationCap, Package, Scissors } from "lucide-react";
import { OrnStitch } from "@/components/home/home-ornaments";

const CARDS = [
  { href: "/patterns", Icon: Scissors, tag: "PDF + کاغذی", t: "الگوهای آماده", d: "بیش از ۲۰۰ الگوی استاندارد کودک، از نوزادی تا ۱۲ سال" },
  { href: "/fabrics", Icon: Box, tag: "ارگانیک", t: "پارچه مدل‌ها", d: "کتان، لینن، مخمل و تور؛ متری با ضمانت کیفیت", shift: true },
  { href: "/tutorials", Icon: GraduationCap, tag: "رایگان", t: "آموزش دوخت", d: "ویدیوهای قدم‌به‌قدم برای مادران خوش‌سلیقه" },
  { href: "/kits", Icon: Package, tag: "پرفروش", t: "کیت دوخت خانگی", d: "الگو + پارچه + نخ و دکمه، همه در یک جعبه", shift: true },
];

export function Atelier() {
  return (
    <section id="atelier" className="relative overflow-hidden bg-sand py-12 dark:bg-transparent sm:py-16 lg:py-20">
      <span className="font-display pointer-events-none absolute top-10 left-8 hidden select-none text-[120px] leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(193,147,87,.55)] -rotate-6 xl:block">
        atelier
      </span>
      <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7 grid items-center gap-16 sm:gap-14 lg:grid-cols-2 lg:gap-10">
        <div className="relative order-2 h-90 transition-all duration-700 ease-out min-[420px]:h-105 sm:h-135 lg:order-1">
          <div className="absolute top-0 right-0 w-[78%] overflow-hidden rounded-2xl shadow-2xl shadow-navy/20 rotate-2 sm:rounded-[28px]">
            <Image src="/brand/look-knit-portrait.jpg" alt="پارچه‌های آتلیه ملی‌کیدز" width={768} height={1152} quality={95} className="h-56 w-full object-cover object-center min-[420px]:h-64 sm:h-90" />
          </div>
          <div className="absolute bottom-0 left-0 z-10 w-[52%] overflow-hidden rounded-xl border-4 border-white shadow-2xl shadow-navy/25 -rotate-3 sm:rounded-3xl sm:border-8">
            <Image src="/brand/cat-girl-portrait.jpg" alt="مدل دوخته‌شده با الگوی آماده" width={922} height={1152} quality={95} className="h-44 w-full object-cover object-top min-[420px]:h-52 sm:h-75" />
          </div>
          <div className="absolute top-4 left-1 z-20 h-20 w-20 animate-floaty overflow-hidden rounded-xl border-4 border-white shadow-xl rotate-6 min-[420px]:h-24 min-[420px]:w-24 sm:top-6 sm:left-8 sm:h-28 sm:w-28 sm:rounded-2xl">
            <Image src="/brand/look-knit-portrait.jpg" alt="نمونه بافت" width={768} height={1152} quality={95} className="h-full w-full object-cover object-top" />
          </div>
          <div className="absolute -bottom-1 right-4 z-20 flex items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-cream shadow-xl sm:-bottom-2 sm:right-12 sm:rounded-2xl sm:px-5 sm:py-3">
            <Scissors className="h-4 w-4 shrink-0 text-gold" />
            <span className="whitespace-nowrap text-xs font-bold sm:text-sm">+۲۰۰ الگوی اختصاصی</span>
          </div>
        </div>
        <div className="order-1 transition-all duration-700 ease-out lg:order-2">
          <span className="text-sm font-bold tracking-wide text-gold">آتلیه ملی‌کیدز</span>
          <h2 className="mt-2 text-[clamp(1.5rem,5.5vw,2.625rem)] font-black leading-snug text-navy dark:text-ivory">
            الگوی آماده و{" "}
            <span className="relative inline-block text-gold">
              پارچه‌ مدل‌ها
              <OrnStitch className="absolute -bottom-2 right-0 w-16" />
            </span>
          </h2>
          <p className="mt-4 text-sm leading-7 text-navy/60 dark:text-wheat sm:mt-5 sm:text-base sm:leading-8">
            دوست دارید خودتان بدوزید؟ الگوی دقیق هر مدل را همراه با پارچه‌ی اصلِ همان کالکشن دریافت کنید و اثر ماندگار خودتان را بسازید.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-3.5 min-[480px]:grid-cols-2 sm:mt-9 sm:gap-4">
            {CARDS.map((c) => (
              <a
                key={c.t}
                href={c.href}
                className={`group relative rounded-2xl border border-navy/5 bg-white/92 p-5 transition-all hover:-translate-y-1 hover:border-gold/50 hover:shadow-xl hover:shadow-gold/10 dark:border-gold/25 dark:bg-slate/55 sm:rounded-3xl sm:p-6 ${c.shift ? "min-[480px]:translate-y-5" : ""}`}
              >
                <span className="absolute top-4 left-4 rounded-full bg-gold/15 px-2.5 py-1 text-[10px] font-black text-gold sm:top-5 sm:left-5">{c.tag}</span>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy/5 transition-colors group-hover:bg-gold/15 sm:h-12 sm:w-12 sm:rounded-2xl">
                  <c.Icon className="h-5 w-5 text-navy transition-colors group-hover:text-gold dark:text-ivory sm:h-6 sm:w-6" />
                </span>
                <h4 className="mt-3.5 text-base font-black text-navy dark:text-ivory sm:mt-4 sm:text-lg">{c.t}</h4>
                <p className="mt-1.5 text-xs leading-6 text-navy/55 dark:text-wheat sm:mt-2 sm:text-sm">{c.d}</p>
              </a>
            ))}
          </div>
          <a href="/about" className="mt-10 inline-flex min-h-11 items-center gap-2 border-b-2 border-gold pb-1 text-sm font-black text-navy transition-colors hover:text-gold dark:text-ivory min-[480px]:mt-14 sm:text-base">
            ورود به آتلیه
            <ArrowLeft className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

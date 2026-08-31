import Image from "next/image";
import Link from "next/link";
import { ArrowDownLeft } from "lucide-react";
import { OrnLeaf } from "@/components/home/home-ornaments";

const BIG = [
  {
    href: "/#styles",
    img: "/brand/cat-girl-portrait.jpg",
    t: "دخترانه",
    d: "+۱۴۰ مدل فعال",
  },
  {
    href: "/#styles",
    img: "/brand/cat-boy-portrait.jpg",
    t: "پسرانه",
    d: "+۱۲۰ مدل فعال",
  },
];

const SMALL = [
  {
    href: "/#styles",
    img: "/brand/cat-baby-portrait.jpg",
    t: "سیسمونی",
    d: "۰ تا ۲۴ ماه",
  },
  {
    href: "/#styles",
    img: "/brand/cat-boy-portrait.jpg",
    t: "لباس مشاغل",
    d: "رویاهای بزرگ",
  },
  {
    href: "/#styles",
    img: "/brand/cat-accessories-portrait.jpg",
    t: "اکسسوری",
    d: "تکمیلِ استایل",
    top: true,
  },
  {
    href: "/#handmade",
    img: "/brand/look-knit-portrait.jpg",
    t: "دستدوز خاص",
    d: "تک‌نسخه‌ای",
  },
];

export function Categories() {
  return (
    <section id="categories" className="bg-transparent py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7">
        <div className="mb-10 flex flex-col justify-between gap-4 transition-all duration-700 ease-out sm:mb-12 sm:flex-row sm:items-end">
          <div>
            <span className="text-gold text-sm font-bold tracking-wide">
              دسته‌بندی‌ها
            </span>
            <h2 className="text-navy dark:text-ivory mt-2 text-[clamp(1.5rem,5.5vw,2.625rem)] leading-snug font-black">
              برای هر لحظه،{" "}
              <span className="text-gold relative inline-block">
                یک استایل
                <OrnLeaf className="absolute -bottom-3 -left-8 hidden h-6 w-10 sm:block" />
              </span>
            </h2>
          </div>
          <p className="text-navy/55 dark:text-wheat max-w-md text-sm leading-7 sm:text-[15px]">
            از سیسمونی لطیف تا لباس مشاغل فانتزی؛ هر دسته با وسواس یک مادر
            انتخاب و دوخته شده است.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 transition-all duration-700 ease-out min-[360px]:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {BIG.map((card) => (
            <Link
              key={card.t}
              href={card.href}
              className="group shadow-navy/10 relative col-span-2 block h-64 overflow-hidden rounded-2xl shadow-lg min-[420px]:h-80 sm:h-105 sm:rounded-[28px]"
            >
              <Image
                src={card.img}
                alt={card.t}
                width={600}
                height={750}
                sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) calc(100vw - 3rem), 50vw"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="from-navy-deep/85 via-navy/20 absolute inset-0 bg-linear-to-t to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2.5 p-4 sm:gap-3 sm:p-6">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <span className="border-navy/15 bg-paper-warm text-navy rounded-full border px-2.5 py-1 text-[10px] font-black whitespace-nowrap sm:px-3 sm:py-1.5 sm:text-xs">
                    پاییز – زمستان
                  </span>
                  <span className="border-navy/15 bg-paper-warm text-navy rounded-full border px-2.5 py-1 text-[10px] font-black whitespace-nowrap sm:px-3 sm:py-1.5 sm:text-xs">
                    بهار – تابستان
                  </span>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-xl font-black text-white sm:text-3xl">
                      {card.t}
                    </h3>
                    <p className="text-cream/70 mt-1 text-xs sm:text-sm">
                      {card.d}
                    </p>
                  </div>
                  <span className="bg-gold text-navy-deep flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform duration-500 group-hover:rotate-45 sm:h-12 sm:w-12">
                    <ArrowDownLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
          {SMALL.map((card) => (
            <Link
              key={card.t}
              href={card.href}
              className="group shadow-navy/10 relative block h-52 overflow-hidden rounded-xl shadow-lg min-[420px]:h-64 sm:h-80 sm:rounded-3xl lg:h-105"
            >
              <Image
                src={card.img}
                alt={card.t}
                width={600}
                height={750}
                sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) calc(50vw - 2rem), 25vw"
                className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${card.top ? "object-top" : ""}`}
              />
              <div className="from-navy-deep/80 via-navy/10 absolute inset-0 bg-linear-to-t to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3.5 sm:p-5">
                <div className="min-w-0">
                  <h3 className="text-base font-black text-white sm:text-xl">
                    {card.t}
                  </h3>
                  <p className="text-cream/70 mt-1 text-[11px] sm:text-xs">
                    {card.d}
                  </p>
                </div>
                <span className="bg-navy/40 group-hover:border-gold group-hover:bg-gold group-hover:text-navy-deep hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/30 text-white transition-all min-[420px]:flex sm:h-9 sm:w-9">
                  <ArrowDownLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

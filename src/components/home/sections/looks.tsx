import Image from "next/image";
import Link from "next/link";

const LOOKS = [
  {
    href: "/shop?cat=دخترانه",
    img: "/brand/look-party.jpg",
    k: "GIRLS",
    t: "دخترانه",
  },
  {
    href: "/shop?cat=پسرانه",
    img: "/brand/cat-boy-portrait.jpg",
    k: "BOYS",
    t: "پسرانه",
  },
  {
    href: "/shop?cat=سیسمونی",
    img: "/brand/cat-baby-portrait.jpg",
    k: "BABY",
    t: "سیسمونی",
  },
];

export function Looks() {
  return (
    <section id="multi" className="py-10 sm:py-14">
      <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {LOOKS.map((card) => (
            <Link
              key={card.t}
              href={card.href}
              className="group bg-navy hover:border-gold/50 relative min-h-50 overflow-hidden rounded-[28px] border border-white/0 shadow-[0_18px_40px_-22px_rgba(14,42,71,.45)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_50px_-18px_rgba(193,147,87,.35)] sm:min-h-65"
            >
              <Image
                src={card.img}
                alt={card.t}
                width={600}
                height={800}
                sizes="(max-width: 639px) calc(100vw - 2rem), 33vw"
                className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="from-navy-deep via-navy/35 absolute inset-0 bg-linear-to-t to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-gold-light text-[10px] font-bold tracking-[0.2em]">
                  {card.k}
                </p>
                <h3 className="mt-1 text-xl font-black text-white">{card.t}</h3>
                <span className="text-ivory/85 mt-2 inline-flex items-center gap-1 text-xs font-bold">
                  مشاهده کالکشن →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

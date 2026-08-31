import Image from "next/image";
import Link from "next/link";

const SLIDES = [
  { href: "/articles/size", img: "/brand/cat-baby-portrait.jpg", tag: "اندازه", title: "راهنمای سایز بدون اشتباه", excerpt: "قد و دور سینه را چطور بگیرید تا لباس برنگردد." },
  { href: "/articles/fabric", img: "/brand/look-knit-portrait.jpg", tag: "مراقبت", title: "پارچه مناسب پوست حساس", excerpt: "پنبه ارگانیک، شست‌وشو و اتوی بی‌خطر برای نوزاد." },
  { href: "/articles/party", img: "/brand/look-party.jpg", tag: "استایل", title: "استایل جشن تولد دخترانه", excerpt: "پیراهن مجلسی را با تل و کفش چطور ست کنید." },
  { href: "/articles/size", img: "/brand/cat-girl-portrait.jpg", tag: "راهنما", title: "بین دو سایز کدام را بردارید؟", excerpt: "برای پالتو و لباس رویی معمولاً سایز بزرگ‌تر راحت‌تر است." },
  { href: "/articles/fabric", img: "/brand/cat-boy-portrait.jpg", tag: "دوخت", title: "چرا الگوی آزاد برای بازی مهم است", excerpt: "درز آزاد یعنی کودک می‌دود و لباس کش نمی‌آید." },
];

export function HomeJournalSlides() {
  return (
    <>
      {SLIDES.map((s) => (
        <div className="min-w-0 shrink-0 basis-[86%] sm:basis-1/2 lg:basis-1/3 pe-5 box-border" key={s.title}>
          <Link href={s.href} className="group block h-full overflow-hidden rounded-3xl border border-navy/10 bg-white/92 no-underline shadow-[0_14px_32px_-22px_rgba(14,42,71,.25)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/45 hover:shadow-[0_20px_40px_-20px_rgba(193,147,87,.28)] dark:border-gold/30 dark:bg-slate/55">
            <div className="aspect-16/10 overflow-hidden bg-sand">
              <Image
                src={s.img}
                alt=""
                width={640}
                height={400}
                sizes="(max-width: 639px) 86vw, (max-width: 1023px) 50vw, 33vw"
                className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="p-5">
              <span className="text-[10px] font-black text-gold tracking-widest">{s.tag}</span>
              <h3 className="mt-1.5 mb-0 font-black text-navy dark:text-linen text-[0.98rem] leading-snug">{s.title}</h3>
              <p className="mt-1.5 mb-0 text-xs text-navy/50 dark:text-khaki leading-7">{s.excerpt}</p>
            </div>
          </Link>
        </div>
      ))}
    </>
  );
}

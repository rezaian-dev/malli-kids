import Image from "next/image";
import { HomeSearch } from "@/components/home/home-search";

export function Find() {
  return (
    <section id="searchHome" className="relative overflow-visible py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Image
            src="/brand/search-bg.jpg"
            alt=""
            width={1600}
            height={900}
            sizes="100vw"
            className="absolute inset-0 h-full w-full scale-105 object-cover"
          />
          <div className="absolute inset-0 bg-navy-deep/45" />
          <div className="absolute inset-0 bg-linear-to-l from-navy/60 via-navy/25 to-navy/60" />
        </div>
      <div className="container relative z-10 mx-auto w-full max-w-3xl px-4 text-center sm:px-5 lg:px-7">
        <p className="text-[11px] font-bold tracking-[0.28em] text-gold-light">FIND THE LOOK</p>
        <h2 className="mt-3 text-[clamp(1.6rem,4vw,2.4rem)] font-black leading-snug text-ivory">
          کوچولوتان را در کالکشن پیدا کنید
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ivory/85 sm:text-base">
          نام لباس، دسته یا استایل را بنویسید؛ نتیجه همان لحظه دیده می‌شود.
        </p>
        <HomeSearch />
      </div>
    </section>
  );
}

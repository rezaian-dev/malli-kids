import Image from "next/image";
import { BadgeCheck, ThumbsUp } from "lucide-react";

const REVIEWS = [
  {
    featured: true,
    name: "سارا محمدی",
    initial: "س",
    product: "پیراهن مجلسی الماسِ طلایی",
    date: "۳ مرداد ۱۴۰۵",
    rate: 5,
    img: "/brand/look-party.jpg",
    text: "برای جشن تولد دخترم سفارشش دادم؛ کیفیت دوخت و پارچه از عکس‌ها هم بهتر بود. پرو مجازی دقیقاً همان سایزی را پیشنهاد داد که تنش شد.",
    helpful: 148,
  },
  {
    name: "نگار احمدی",
    initial: "ن",
    product: "ست سیسمونی مریم (۷ تکه)",
    date: "۲۷ تیر ۱۴۰۵",
    rate: 5,
    img: "/brand/cat-baby-portrait.jpg",
    text: "هر هفت تکه‌اش را برای نوزادی‌ام گرفتم؛ پارچه فوق‌العاده لطیف است و بعد از چند بار شست‌وشو هم رنگش نرفت.",
    helpful: 96,
  },
  {
    name: "مریم رضایی",
    initial: "م",
    product: "ژاکت بافت رُز · دستدوز",
    date: "۱۸ تیر ۱۴۰۵",
    rate: 4,
    img: "/brand/look-knit-portrait.jpg",
    text: "قلاب‌بافی‌اش واقعاً دست‌دوز است و تک‌نسخه بودنش برایم ارزشمند بود؛ همه سراغش را می‌گیرند.",
    helpful: 57,
  },
  {
    name: "آرش توکلی",
    initial: "آ",
    product: "ست پیراهن و بند شلوار کلاسیک",
    date: "۱۲ تیر ۱۴۰۵",
    rate: 5,
    img: "/brand/cat-boy-portrait.jpg",
    text: "برای پسرم که همیشه از لباس‌های سفت فرار می‌کرد عالی بود؛ الگویش آزاد است و دوختش تمیز.",
    helpful: 41,
  },
];

function Stars({ count }: { count: number }) {
  return <span aria-label={`${count} از ۵`} className="text-sm text-gold">{"★".repeat(count)}<span className="text-ivory/25">{"★".repeat(5 - count)}</span></span>;
}

// 💬 Static review deck keeps the section readable with near-zero runtime.
export function HomeQuotes() {
  return (
    <div className="space-y-3">
      <p className="text-center text-[11px] font-bold text-navy/45 dark:text-wheat/70 md:hidden">برای دیدن نظرهای بیشتر، کارت‌ها را افقی اسکرول کنید.</p>
      <div className="overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max gap-3 lg:grid lg:min-w-0 lg:grid-cols-2 xl:grid-cols-4">
          {REVIEWS.map((review) => (
            <article
              key={review.name}
              className={`relative flex h-full w-[min(85vw,22rem)] shrink-0 snap-start flex-col overflow-hidden rounded-[22px] bg-navy p-4 text-ivory shadow-lg sm:w-[22rem] sm:rounded-[28px] sm:p-6 dark:bg-dusk-deep dark:ring-1 dark:ring-gold/30 lg:w-auto ${review.featured ? "xl:col-span-2" : ""}`}
            >
              <div className="relative flex min-h-0 flex-1 flex-col gap-4 sm:flex-row">
                <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-2xl sm:h-auto sm:w-28">
                  <Image src={review.img} alt="" width={112} height={144} sizes="(min-width: 640px) 7rem, 85vw" className="size-full object-cover" />
                  <div className="absolute inset-0 bg-linear-to-t from-navy/55 to-transparent" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    {review.featured ? <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-black text-navy-deep">نظر منتخب</span> : null}
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-bold text-gold-glow">
                      <BadgeCheck className="size-3.5" /> تأییدشده
                    </span>
                    <Stars count={review.rate} />
                  </div>
                  <p className="min-h-18 text-sm leading-6 font-medium text-ivory sm:min-h-21 sm:leading-7">«{review.text}»</p>
                  <div className="mt-auto flex flex-col gap-3 border-t border-white/10 pt-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold text-sm font-black text-navy-deep">{review.initial}</span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-white">{review.name}</p>
                        <p className="mt-0.5 truncate text-[11px] text-wheat">{review.product}</p>
                        <p className="mt-0.5 text-[10px] text-taupe">{review.date}</p>
                      </div>
                    </div>
                    <span className="inline-flex min-h-9 w-max shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold text-ivory">
                      <ThumbsUp className="size-3.5" /> مفید ({review.helpful})
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

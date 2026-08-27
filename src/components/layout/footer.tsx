import Link from "next/link";
import { ArrowLeft, Camera, Clock, Headphones, MapPin, Phone, RotateCcw, Send, Share2, ShieldCheck, Truck } from "lucide-react";
import { shell } from "@/lib/utils";

const PERKS = [
  { Icon: Truck, t: "ارسال سریع", d: "سراسر کشور · ۲ تا ۴ روز کاری" },
  { Icon: ShieldCheck, t: "پارچه ضدحساسیت", d: "گواهی OEKO-TEX برای پوست کودک" },
  { Icon: RotateCcw, t: "۷ روز بازگشت", d: "بدون قید و شرط" },
  { Icon: Headphones, t: "پشتیبانی مادری", d: "مشاوره سایز، هر روز هفته" },
];

const soc = "size-11 rounded-full bg-white/10 text-gold-light inline-flex items-center justify-center hover:-translate-y-0.5 transition-transform";

/** لینک‌های ستونی فوتر: ارتفاع لمسیِ ۴۴px روی موبایل، جمع‌تر روی دسکتاپ. */
const FOOT_LINK =
  "inline-flex min-h-11 items-center py-1 transition-colors hover:text-gold md:min-h-9";

export function Footer() {
  return (
    <footer dir="rtl" className="relative bg-navy-deep text-cream-mute">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-l from-transparent via-gold to-transparent" aria-hidden />
      <div className="border-b border-white/10">
        <div className={`${shell} grid grid-cols-[repeat(auto-fit,minmax(13.75rem,1fr))] gap-5 py-9 sm:py-11`}>
          {PERKS.map(({ Icon, t, d }) => (
            <div key={t} className="flex min-w-0 items-center gap-3.5">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-gold">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0">
                <h4 className="m-0 text-sm font-bold text-white">{t}</h4>
                <p className="mt-1 text-xs leading-snug text-taupe">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-b border-white/10">
        <div className={`${shell} flex flex-wrap items-center justify-between gap-6 py-10 sm:py-12`}>
          <div className="min-w-0 flex-1 basis-65">
            <h3 className="m-0 text-[clamp(18px,2.4vw,24px)] font-black leading-snug text-white">
              اولین نفری باشید که <span className="text-gold-light">کالکشن جدید</span> را می‌بیند
            </h3>
            <p className="mt-2 text-sm text-taupe">عضو خبرنامه شوید و ۱۰٪ تخفیف اولین خرید بگیرید.</p>
          </div>
          <form
            action="/contact"
            className="flex w-full max-w-md items-center rounded-full border border-white/20 bg-white/5 p-1.5 transition-all duration-300 focus-within:border-gold/60 focus-within:bg-white/10 focus-within:shadow-[0_0_0_4px_rgba(196,147,87,.18)]"
          >
            <input type="email" name="email" required placeholder="ایمیل شما…" className="newsletter-field h-10 min-w-0 flex-1 rounded-full bg-transparent px-4 text-sm text-cream outline-none placeholder:text-taupe" />
            <button
              type="submit"
              className="group/nl inline-flex h-10 items-center gap-1 rounded-full bg-gold px-5 text-[13px] font-black text-navy-deep transition-transform duration-200 hover:scale-[1.03] active:scale-95"
            >
              عضویت <ArrowLeft className="size-4 transition-transform duration-200 group-hover/nl:-translate-x-0.5" />
            </button>
          </form>
        </div>
      </div>

      <div className={`${shell} grid grid-cols-[repeat(auto-fit,minmax(11.25rem,1fr))] gap-8 py-10 sm:py-12`}>
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <img src="/brand/logo-white.png" alt="لوگوی ملی‌کیدز" width={56} height={56} className="size-14 object-contain" />
            <div className="leading-none">
              <span className="block font-display text-lg font-bold tracking-[0.18em] text-white">MALLI</span>
              <span className="mt-1 block font-display text-[11px] tracking-[0.42em] text-gold-light">KIDS</span>
            </div>
          </div>
          <p className="mt-4 max-w-65 text-sm leading-7 text-taupe">بوتیک پوشاک کودک؛ هر دوخت یک قصه برای کوچولوی شما.</p>
          <div className="mt-5 flex gap-2.5">
            <Link href="/contact" aria-label="اینستاگرام" className={soc}><Camera className="size-4" /></Link>
            <Link href="/contact" aria-label="تلگرام" className={soc}><Send className="size-4" /></Link>
            <Link href="/contact" aria-label="ایتا" className={soc}><Share2 className="size-4" /></Link>
            <Link href="/contact" aria-label="تماس" className={soc}><Phone className="size-4" /></Link>
          </div>
        </div>
        <div>
          <h5 className="mb-4 text-[15px] font-black text-white">دسته‌بندی‌ها</h5>
          <ul className="m-0 grid list-none gap-0.5 p-0 text-sm">
            <li><Link href="/shop?cat=دخترانه" className={FOOT_LINK}>دخترانه</Link></li>
            <li><Link href="/shop?cat=پسرانه" className={FOOT_LINK}>پسرانه</Link></li>
            <li><Link href="/shop?cat=سیسمونی" className={FOOT_LINK}>سیسمونی</Link></li>
            <li><Link href="/shop?cat=دستدوز" className={FOOT_LINK}>دستدوز خاص</Link></li>
            <li><Link href="/shop" className={FOOT_LINK}>همه محصولات</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="mb-4 text-[15px] font-black text-white">دسترسی سریع</h5>
          <ul className="m-0 grid list-none gap-0.5 p-0 text-sm">
            <li><Link href="/tryon" className={FOOT_LINK}>پرو مجازی</Link></li>
            <li><Link href="/size-guide" className={FOOT_LINK}>راهنمای سایز</Link></li>
            <li><Link href="/shipping" className={FOOT_LINK}>ارسال و بازگشت</Link></li>
            <li><Link href="/faq" className={FOOT_LINK}>سوالات متداول</Link></li>
            <li><Link href="/about" className={FOOT_LINK}>درباره ما</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="mb-4 text-[15px] font-black text-white">تماس با ما</h5>
          <ul className="m-0 grid list-none gap-3.5 p-0 text-sm text-taupe">
            <li className="flex items-start gap-2.5"><MapPin className="mt-0.5 size-4 shrink-0 text-gold-light" /><span>تهران، خیابان ولیعصر، گالری ملی‌کیدز</span></li>
            <li className="flex items-center gap-2.5"><Phone className="size-4 shrink-0 text-gold-light" /><span dir="ltr">۰۲۱ — ۲۶۴۰ ۱۲۳۴</span></li>
            <li className="flex items-start gap-2.5"><Clock className="mt-0.5 size-4 shrink-0 text-gold-light" /><span>شنبه تا پنجشنبه<br />۹ صبح تا ۹ شب</span></li>
          </ul>
        </div>
      </div>

      {/* Trust badges — official Iranian e-commerce seals.
          NOTE: replace each href with the verification URL issued for this domain
          (e.g. https://trustseal.enamad.ir/?id=…&Code=… and the samandehi logo link). */}
      <div className="border-t border-white/10">
        <div className={`${shell} flex flex-col items-center justify-between gap-6 py-8 sm:flex-row`}>
          <div className="flex items-center gap-3.5 text-center sm:text-start">
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gold/15 text-gold">
              <ShieldCheck className="size-6" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-black text-white">خرید امن و احراز هویت‌شده</p>
              <p className="mt-1 text-xs leading-relaxed text-taupe">دارای مجوزهای رسمی فروشگاه اینترنتی در ایران</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://enamad.ir"
              target="_blank"
              rel="noreferrer"
              aria-label="نماد اعتماد الکترونیکی"
              className="grid size-24 place-items-center rounded-2xl bg-white p-2.5 shadow-lg ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:ring-gold/50"
            >
              <img src="/brand/enamad.png" alt="نماد اعتماد الکترونیکی" width={466} height={429} className="max-h-full w-auto object-contain" />
            </a>
            <a
              href="https://samandehi.ir"
              target="_blank"
              rel="noreferrer"
              aria-label="نشان ملی ثبت رسانه‌های دیجیتال (ساماندهی)"
              className="grid h-24 w-40 place-items-center rounded-2xl bg-white p-2.5 shadow-lg ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:ring-gold/50"
            >
              <img src="/brand/samandehi.png" alt="نشان ملی ثبت (ساماندهی)" width={700} height={391} className="max-h-full w-auto object-contain" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className={`${shell} flex flex-wrap items-center justify-between gap-2.5 py-5 text-center text-xs text-cream/40`}>
          <span>© ۱۴۰۴ ملی‌کیدز — تمامی حقوق محفوظ است. <Link href="/terms" className="py-1 hover:text-gold">قوانین</Link> · <Link href="/privacy" className="py-1 hover:text-gold">حریم خصوصی</Link></span>
          <span className="font-display tracking-[0.28em] text-gold/50">MALLI KIDS</span>
        </div>
      </div>
    </footer>
  );
}

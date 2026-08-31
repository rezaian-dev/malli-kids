import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  Headphones,
  MapPin,
  Phone,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { EitaaIcon } from "@/components/shared/eitaa-icon";
import { shell } from "@/lib/utils";
import { NewsletterForm } from "./newsletter-form";

const PERKS = [
  { Icon: Truck, t: "ارسال سریع", d: "سراسر کشور · ۲ تا ۴ روز کاری" },
  {
    Icon: ShieldCheck,
    t: "پارچه ضدحساسیت",
    d: "گواهی OEKO-TEX برای پوست کودک",
  },
  { Icon: RotateCcw, t: "۷ روز بازگشت", d: "بدون قید و شرط" },
  { Icon: Headphones, t: "پشتیبانی مادری", d: "مشاوره سایز، هر روز هفته" },
];

const FOOT_LINK =
  "inline-flex min-h-11 items-center py-1 transition-colors hover:text-gold md:min-h-9";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9c-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.13 1.38C1.35 2.68.93 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.13.67.66 1.34 1.08 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.72 2.13-1.38.66-.67 1.08-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.79-.72-1.46-1.38-2.13C21.32 1.35 20.65.93 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84ZM12 16a4 4 0 1 1 4-4 4 4 0 0 1-4 4Zm7.85-10.4a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44Z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M11.94 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.06 0Zm4.97 7.22c.1 0 .32.02.46.14a.5.5 0 0 1 .17.33c.02.09.04.3.02.47-.18 1.9-.96 6.5-1.36 8.63-.17.9-.5 1.2-.82 1.23-.7.06-1.22-.46-1.9-.9-1.06-.7-1.65-1.13-2.68-1.8-1.18-.79-.42-1.21.26-1.91.18-.19 3.25-2.98 3.31-3.23.01-.03.01-.15-.06-.21s-.17-.04-.25-.03c-.1.03-1.79 1.14-5.06 3.35-.48.33-.91.49-1.3.48-.43-.01-1.25-.24-1.87-.44-.75-.25-1.35-.37-1.3-.79.03-.22.33-.44.9-.66 3.5-1.53 5.83-2.53 7-3.02 3.33-1.38 4.02-1.62 4.47-1.63Z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.48s1.07 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.07-.13-.27-.2-.57-.35Zm-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.37l-.36-.22-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88a9.83 9.83 0 0 1 9.88 9.89c0 5.45-4.44 9.88-9.88 9.88Zm8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.59 5.94L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.44h.01c6.55 0 11.89-5.33 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41Z" />
    </svg>
  );
}

const SOCIAL_BASE =
  "group relative grid size-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/10 text-gold-light transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent hover:text-white";

const TIP =
  "pointer-events-none absolute -top-8 right-1/2 translate-x-1/2 translate-y-1 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-navy opacity-0 shadow-xl transition-all duration-300 group-hover:-top-9 group-hover:translate-y-0 group-hover:opacity-100";

const SOCIALS = [
  {
    name: "اینستاگرام",
    href: "https://instagram.com/mallikids",
    hover:
      "hover:bg-[#d62976] hover:bg-linear-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:shadow-[0_12px_28px_-10px_rgba(238,42,123,.75)]",
    Icon: InstagramIcon,
  },
  {
    name: "تلگرام",
    href: "https://t.me/mallikids",
    hover:
      "hover:bg-[#2aabee] hover:shadow-[0_12px_28px_-10px_rgba(42,171,238,.75)]",
    Icon: TelegramIcon,
  },
  {
    name: "واتساپ",
    href: "https://wa.me/982126401234",
    hover:
      "hover:bg-[#25d366] hover:shadow-[0_12px_28px_-10px_rgba(37,211,102,.75)]",
    Icon: WhatsAppIcon,
  },
  {
    name: "ایتا",
    href: "https://eitaa.com/mallikids",
    hover:
      "hover:bg-[#f5821f] hover:shadow-[0_12px_28px_-10px_rgba(245,130,31,.75)]",
    Icon: EitaaIcon,
  },
] as const;

export function Footer() {
  return (
    <footer dir="rtl" className="bg-navy-deep text-cream-mute relative">
      <span
        className="via-gold pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-l from-transparent to-transparent"
        aria-hidden
      />
      <div className="border-b border-white/10">
        <div
          className={`${shell} grid grid-cols-[repeat(auto-fit,minmax(13.75rem,1fr))] gap-5 py-9 sm:py-11`}
        >
          {PERKS.map(({ Icon, t, d }) => (
            <div key={t} className="flex min-w-0 items-center gap-3.5">
              <span className="text-gold inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white/10">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0">
                <h4 className="m-0 text-sm font-bold text-white">{t}</h4>
                <p className="text-taupe mt-1 text-xs leading-snug">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-b border-white/10">
        <div
          className={`${shell} flex flex-wrap items-center justify-between gap-6 py-10 sm:py-12`}
        >
          <div className="min-w-0 flex-1 basis-65">
            <h3 className="m-0 text-[clamp(18px,2.4vw,24px)] leading-snug font-black text-white">
              اولین نفری باشید که{" "}
              <span className="text-gold-light">کالکشن جدید</span> را می‌بیند
            </h3>
            <p className="text-taupe mt-2 text-sm">
              عضو خبرنامه شوید و ۱۰٪ تخفیف اولین خرید بگیرید.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      <div
        className={`${shell} grid grid-cols-[repeat(auto-fit,minmax(11.25rem,1fr))] gap-8 py-10 sm:py-12`}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/logo-white.svg"
              alt="لوگوی ملی‌کیدز"
              width={56}
              height={56}
              className="size-14 object-contain"
            />
            <div className="leading-none">
              <span className="font-display block text-lg font-bold tracking-[0.18em] text-white">
                MALLI
              </span>
              <span className="font-display text-gold-light mt-1 block text-[11px] tracking-[0.42em]">
                KIDS
              </span>
            </div>
          </div>
          <p className="text-taupe mt-4 max-w-65 text-sm leading-7">
            بوتیک پوشاک کودک؛ هر دوخت یک قصه برای کوچولوی شما.
          </p>
          <div className="mt-5 flex gap-2.5">
            {SOCIALS.map(({ name, href, hover, Icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={name}
                className={`${SOCIAL_BASE} ${hover}`}
              >
                <span className={TIP}>{name}</span>
                <Icon className="size-4.5 transition-transform duration-300 group-hover:scale-115 group-hover:-rotate-6" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h5 className="mb-4 text-[15px] font-black text-white">
            دسته‌بندی‌ها
          </h5>
          <ul className="m-0 grid list-none gap-0.5 p-0 text-sm">
            <li>
              <Link href="/shop?cat=دخترانه" className={FOOT_LINK}>
                دخترانه
              </Link>
            </li>
            <li>
              <Link href="/shop?cat=پسرانه" className={FOOT_LINK}>
                پسرانه
              </Link>
            </li>
            <li>
              <Link href="/shop?cat=سیسمونی" className={FOOT_LINK}>
                سیسمونی
              </Link>
            </li>
            <li>
              <Link href="/shop?cat=دستدوز" className={FOOT_LINK}>
                دستدوز خاص
              </Link>
            </li>
            <li>
              <Link href="/shop" className={FOOT_LINK}>
                همه محصولات
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h5 className="mb-4 text-[15px] font-black text-white">
            دسترسی سریع
          </h5>
          <ul className="m-0 grid list-none gap-0.5 p-0 text-sm">
            <li>
              <Link href="/tryon" className={FOOT_LINK}>
                پرو مجازی
              </Link>
            </li>
            <li>
              <Link href="/size-guide" className={FOOT_LINK}>
                راهنمای سایز
              </Link>
            </li>
            <li>
              <Link href="/shipping" className={FOOT_LINK}>
                ارسال و بازگشت
              </Link>
            </li>
            <li>
              <Link href="/faq" className={FOOT_LINK}>
                سوالات متداول
              </Link>
            </li>
            <li>
              <Link href="/about" className={FOOT_LINK}>
                درباره ما
              </Link>
            </li>
            <li>
              <Link href="/collab" className={FOOT_LINK}>
                همکاری با ما
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h5 className="mb-4 text-[15px] font-black text-white">تماس با ما</h5>
          <ul className="text-taupe m-0 grid list-none gap-3.5 p-0 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin className="text-gold-light mt-0.5 size-4 shrink-0" />
              <span>تهران، خیابان ولیعصر، گالری ملی‌کیدز</span>
            </li>
            <li>
              <a
                href="tel:+982126401234"
                dir="ltr"
                aria-label="تماس با ملی‌کیدز"
                className="hover:text-gold-light focus-visible:text-gold-light inline-flex min-h-11 items-center gap-2.5 rounded-lg px-1 py-1 transition-colors"
              >
                <Phone className="text-gold-light size-4 shrink-0" />
                <span>۰۲۱ — ۲۶۴۰ ۱۲۳۴</span>
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="text-gold-light mt-0.5 size-4 shrink-0" />
              <span>
                شنبه تا پنجشنبه
                <br />۹ صبح تا ۹ شب
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Trust badges — official Iranian e-commerce seals.
          NOTE: replace each href with the verification URL issued for this domain
          (e.g. https://trustseal.enamad.ir/?id=…&Code=… and the samandehi logo link). */}
      <div className="border-t border-white/10">
        <div
          className={`${shell} flex flex-col items-center justify-between gap-6 py-8 sm:flex-row`}
        >
          <div className="flex items-center gap-3.5 text-center sm:text-start">
            <span className="bg-gold/15 text-gold inline-flex size-12 shrink-0 items-center justify-center rounded-2xl">
              <ShieldCheck className="size-6" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-black text-white">
                خرید امن و احراز هویت‌شده
              </p>
              <p className="text-taupe mt-1 text-xs leading-relaxed">
                دارای مجوزهای رسمی فروشگاه اینترنتی در ایران
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://enamad.ir"
              target="_blank"
              rel="noreferrer"
              aria-label="نماد اعتماد الکترونیکی"
              className="hover:ring-gold/50 grid size-24 place-items-center rounded-2xl bg-white p-2.5 shadow-lg ring-1 ring-white/10 transition hover:-translate-y-0.5"
            >
              <Image
                src="/brand/enamad.png"
                alt="نماد اعتماد الکترونیکی"
                width={466}
                height={429}
                className="max-h-full w-auto object-contain"
              />
            </a>
            <a
              href="https://samandehi.ir"
              target="_blank"
              rel="noreferrer"
              aria-label="نشان ملی ثبت رسانه‌های دیجیتال (ساماندهی)"
              className="hover:ring-gold/50 grid h-24 w-40 place-items-center rounded-2xl bg-white p-2.5 shadow-lg ring-1 ring-white/10 transition hover:-translate-y-0.5"
            >
              <Image
                src="/brand/samandehi.png"
                alt="نشان ملی ثبت (ساماندهی)"
                width={700}
                height={391}
                className="max-h-full w-auto object-contain"
              />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div
          className={`${shell} text-cream/40 flex flex-wrap items-center justify-between gap-2.5 py-5 text-center text-xs`}
        >
          <span>
            © ۱۴۰۴ ملی‌کیدز — تمامی حقوق محفوظ است.{" "}
            <Link href="/terms" className="hover:text-gold py-1">
              قوانین
            </Link>{" "}
            ·{" "}
            <Link href="/privacy" className="hover:text-gold py-1">
              حریم خصوصی
            </Link>
          </span>
          <span className="font-display text-gold/50 tracking-[0.28em]">
            MALLI KIDS
          </span>
        </div>
      </div>
    </footer>
  );
}

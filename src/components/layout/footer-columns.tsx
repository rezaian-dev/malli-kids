import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import { EitaaIcon } from "@/components/shared/eitaa-icon";
import { InstagramIcon } from "@/components/shared/instagram-icon";
import { TelegramIcon } from "@/components/shared/telegram-icon";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { shell } from "@/lib/utils";

const FOOT_LINK =
  "inline-flex min-h-11 items-center py-1 transition-colors hover:text-gold md:min-h-9";
const FOOTER_HEADING = "mb-4 text-[15px] font-black text-white";
const FOOTER_LIST = "m-0 grid list-none gap-0.5 p-0 text-sm";

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

/** 🗂️ Brand+socials / categories / quick links / contact — the four
 *  main footer columns. */
export function FooterColumns() {
  return (
    <div
      className={`${shell} grid grid-cols-[repeat(auto-fit,minmax(11.25rem,1fr))] gap-8 py-10 sm:py-12`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/logo-white.png"
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
      <nav aria-label="دسته‌بندی‌ها">
        <p className={FOOTER_HEADING}>دسته‌بندی‌ها</p>
        <ul className={FOOTER_LIST}>
          <li>
            <Link href="/shop?category=دخترانه" className={FOOT_LINK}>
              دخترانه
            </Link>
          </li>
          <li>
            <Link href="/shop?category=پسرانه" className={FOOT_LINK}>
              پسرانه
            </Link>
          </li>
          <li>
            <Link href="/shop?category=سیسمونی" className={FOOT_LINK}>
              سیسمونی
            </Link>
          </li>
          <li>
            <Link href="/shop?category=دستدوز" className={FOOT_LINK}>
              دستدوز خاص
            </Link>
          </li>
          <li>
            <Link href="/shop" className={FOOT_LINK}>
              همه محصولات
            </Link>
          </li>
        </ul>
      </nav>
      <nav aria-label="دسترسی سریع">
        <p className={FOOTER_HEADING}>دسترسی سریع</p>
        <ul className={FOOTER_LIST}>
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
      </nav>
      <div>
        <p className={FOOTER_HEADING}>تماس با ما</p>
        <ul className="text-taupe m-0 grid list-none gap-3.5 p-0 text-sm">
          <li className="flex items-start gap-2.5">
            <MapPin className="text-gold-light mt-0.5 size-4 shrink-0" />
            <span>تهران، خیابان ولیعصر، گالری ملی‌کیدز</span>
          </li>
          <li>
            <a
              href="tel:+982126401234"
              dir="ltr"
              aria-label="تماس با ملی‌کیدز: ۰۲۱ — ۲۶۴۰ ۱۲۳۴"
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
  );
}

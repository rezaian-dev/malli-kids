import Link from "next/link";
import { cn, shell } from "@/lib/utils";
import { NewsletterForm } from "./newsletter-form";
import { FooterPerks } from "./footer-perks";
import { FooterColumns } from "./footer-columns";
import { FooterTrustBadges } from "./footer-trust-badges";

export function Footer() {
  return (
    <footer dir="rtl" className="bg-navy-deep text-cream-mute relative">
      <span
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px",
          "via-gold bg-linear-to-l from-transparent to-transparent",
        )}
        aria-hidden
      />
      <FooterPerks />

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

      <FooterColumns />
      <FooterTrustBadges />

      <div className="border-t border-white/10">
        <div
          className={`${shell} text-cream/55 flex flex-wrap items-center justify-between gap-2.5 py-5 text-center text-xs`}
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
          <span className="font-display text-gold/80 tracking-[0.28em]">
            MALLI KIDS
          </span>
        </div>
      </div>
    </footer>
  );
}

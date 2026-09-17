import Link from "next/link";
import { Signature } from "lucide-react";
import { cn, shell } from "@/lib/utils";
import { FadeIn, Reveal } from "@/components/motion/static";
import { FooterPerks } from "./footer-perks";
import { FooterColumns } from "./footer-columns";
import { FooterTrustBadges } from "./footer-trust-badges";

const DEVELOPER_URL = "https://rezaian-dev.vercel.app";

export function Footer() {
  return (
    <footer dir="rtl" className="bg-navy-deep text-cream-mute relative">
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px via-gold bg-linear-to-l from-transparent to-transparent"
        aria-hidden
      />
      <Reveal>
        <FooterPerks />
      </Reveal>

      <Reveal delay={0.1}>
        <FooterColumns />
      </Reveal>
      <Reveal delay={0.15}>
        <FooterTrustBadges />
      </Reveal>

      <FadeIn delay={0.2}>
        <div className="border-t border-white/10">
          <div
            className={cn(
              shell,
              "text-cream/55 flex flex-wrap items-center justify-between gap-2.5 py-5 text-center text-xs",
            )}
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
            <a
              href={DEVELOPER_URL}
              target="_blank"
              rel="noreferrer"
              dir="rtl"
              aria-label="وب‌سایت محمدرضا رضاییان، طراح و توسعه‌دهندهٔ ملی‌کیدز؛ باز شدن در پنجرهٔ جدید"
              className="group inline-flex shrink-0 items-center gap-3 whitespace-nowrap rounded-sm px-1 py-2 text-right"
            >
              <span
                aria-hidden
                className="inline-flex shrink-0 items-center gap-1.5 text-gold-light"
              >
                <Signature className="size-5" strokeWidth={1.5} />
                <span className="border-gold/40 border-s ps-1.5 text-xs font-bold text-cream/85">
                  م.ر
                </span>
              </span>
              <span className="flex min-w-0 flex-col items-start gap-1">
                <span className="text-cream/65 inline-flex items-center gap-2 text-xs font-medium">
                  طراحی و توسعه
                  <span aria-hidden className="bg-gold/70 h-px w-4 shrink-0" />
                </span>
                <span className="inline-flex items-baseline gap-1.5">
                  <span className="relative pb-1 text-lg leading-none font-black text-cream group-hover:text-gold-light group-focus-visible:text-gold-light after:bg-gold/75 after:absolute after:inset-x-0 after:bottom-0 after:h-px">
                    محمدرضا
                  </span>
                  <span className="text-cream/75 text-xs font-medium">
                    رضاییان
                  </span>
                </span>
              </span>
            </a>
            <span className="font-display text-gold/80 tracking-[0.28em]">
              MALLI KIDS
            </span>
          </div>
        </div>
      </FadeIn>
    </footer>
  );
}

import Link from "next/link";
import { Code2 } from "lucide-react";
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
              className="text-cream/45 hover:text-gold-light inline-flex items-center gap-1.5 transition-colors"
            >
              <Code2 className="size-3.5" aria-hidden />
              طراحی و توسعه: رضاییان
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

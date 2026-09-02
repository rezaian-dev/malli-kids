import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { cn, shell } from "@/lib/utils";

// NOTE: replace each href with the verification URL issued for this domain
// (e.g. https://trustseal.enamad.ir/?id=…&Code=… and the samandehi logo link).

/** 🛡️ Official Iranian e-commerce trust seals. */
export function FooterTrustBadges() {
  return (
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
            className={cn(
              "grid size-20 place-items-center p-2 sm:size-24 sm:p-2.5",
              "hover:ring-gold/50 rounded-2xl bg-white shadow-lg ring-1 ring-white/10 transition hover:-translate-y-0.5",
            )}
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
            className={cn(
              "grid h-20 w-32 place-items-center p-2 sm:h-24 sm:w-40 sm:p-2.5",
              "hover:ring-gold/50 rounded-2xl bg-white shadow-lg ring-1 ring-white/10 transition hover:-translate-y-0.5",
            )}
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
  );
}

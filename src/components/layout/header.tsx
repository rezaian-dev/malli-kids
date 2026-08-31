import Image from "next/image";
import Link from "next/link";
import { cn, shell } from "@/lib/utils";
import { FestiveBanner } from "@/components/festive";
import { HeaderActions } from "./header-actions";
import { HeaderNavMount } from "./header-nav-mount";

// 🧭 Server shell with lazy client islands.
export function Header() {
  return (
    <header dir="rtl" className="fixed inset-x-0 top-0 z-70">
      <FestiveBanner />

      <div
        className={cn(
          "border-navy/10 bg-cream/80 border-b shadow-[0_8px_24px_-16px_rgba(14,42,71,.2)]",
          "supports-backdrop-filter:bg-cream/65 backdrop-blur-xl backdrop-saturate-150",
          "dark:border-gold/20 dark:bg-navy-deep/55 dark:supports-backdrop-filter:bg-navy-deep/50 dark:backdrop-blur-xl",
        )}
      >
        <div
          className={cn(shell, "flex h-14 items-center gap-1 sm:h-16 sm:gap-2")}
        >
          <Link href="/" prefetch={false} className="flex shrink-0 items-center gap-1.5">
            <Image
              src="/brand/logo.svg"
              alt="لوگوی ملی‌کیدز"
              width={36}
              height={36}
              sizes="36px"
              className="size-8 object-contain sm:size-9 dark:hidden"
            />
            <Image
              src="/brand/logo-white.svg"
              alt=""
              aria-hidden
              width={36}
              height={36}
              sizes="36px"
              className="hidden size-8 object-contain sm:size-9 dark:block"
            />
            <span className="hidden leading-none min-[480px]:block md:hidden lg:block">
              <span className="font-display text-navy dark:text-linen block text-xs font-bold tracking-[0.16em]">
                MALLI
              </span>
              <span className="font-display text-gold mt-0.5 block text-[10px] tracking-[0.3em]">
                KIDS
              </span>
            </span>
          </Link>

          <HeaderNavMount />
          <HeaderActions />
        </div>
      </div>
    </header>
  );
}

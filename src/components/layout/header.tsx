import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { cn, shell } from "@/lib/utils";
import { FestiveBanner } from "@/components/festive";
import { ICON_BTN } from "./header-styles";
import { DesktopNav } from "./desktop-nav";
import { UserMenu } from "./user-menu";
import { NoticesBell } from "./notices-bell";
import { CartSheet } from "./cart-sheet";
import { MobileNav } from "./mobile-nav";

// 🧭 Server shell with small client islands.
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
          <Link href="/" className="flex shrink-0 items-center gap-1.5">
            <Image
              src="/brand/logo.png"
              alt="لوگوی ملی‌کیدز"
              width={36}
              height={36}
              sizes="36px"
              className="size-8 object-contain sm:size-9 dark:hidden"
            />
            <Image
              src="/brand/logo-white.png"
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

          {/* 🧭 Desktop nav closes itself on route change. */}
          <DesktopNav />

          {/* ⚡ Interactive actions stay isolated in tiny islands. */}
          <div className="ms-auto flex shrink-0 items-center gap-1.5 min-[360px]:gap-2 md:gap-1.5 lg:gap-2">
            <UserMenu />

            <Separator
              orientation="vertical"
              className="bg-navy/15 dark:bg-gold/25 mx-1 hidden h-5! w-px data-vertical:self-center min-[480px]:block md:hidden lg:block"
            />

            <ModeToggle className={ICON_BTN} />
            <NoticesBell />
            <CartSheet />
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}

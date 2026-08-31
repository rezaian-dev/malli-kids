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

// 🧭 Server shell with small client islands for interactive actions.
export function Header() {
  return (
    <header dir="rtl" className="fixed inset-x-0 top-0 z-[70]">
      <FestiveBanner />

      <div
        className={cn(
          "border-b border-navy/10 bg-cream/80 shadow-[0_8px_24px_-16px_rgba(14,42,71,.2)]",
          "backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-cream/65",
          "dark:border-gold/20 dark:bg-navy-deep/55 dark:backdrop-blur-xl dark:supports-[backdrop-filter]:bg-navy-deep/50",
        )}
      >
        <div className={cn(shell, "flex h-14 items-center gap-1 sm:h-16 sm:gap-2")}>
          <Link href="/" className="flex shrink-0 items-center gap-1.5">
            <Image
              src="/brand/logo.png"
              alt="لوگوی ملی‌کیدز"
              width={36}
              height={36}
              priority
              className="size-8 object-contain sm:size-9 dark:hidden"
            />
            <Image
              src="/brand/logo-white.png"
              alt=""
              aria-hidden
              width={36}
              height={36}
              priority
              className="hidden size-8 object-contain sm:size-9 dark:block"
            />
            <span className="hidden leading-none min-[480px]:block md:hidden lg:block">
              <span className="block font-display text-xs font-bold tracking-[0.16em] text-navy dark:text-linen">MALLI</span>
              <span className="mt-0.5 block font-display text-[10px] tracking-[0.3em] text-gold">KIDS</span>
            </span>
          </Link>

          {/* ناوبری دسکتاپ — جزیرهٔ client؛ با تغییر مسیر منو را می‌بندد */}
          <DesktopNav />

          {/* خوشهٔ اکشن‌ها */}
          <div className="ms-auto flex shrink-0 items-center gap-1.5 min-[360px]:gap-2 md:gap-1.5 lg:gap-2">
            <UserMenu />

            <Separator
              orientation="vertical"
              className="mx-1 hidden !h-5 w-px data-vertical:self-center bg-navy/15 min-[480px]:block md:hidden lg:block dark:bg-gold/25"
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

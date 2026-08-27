import Link from "next/link";
import { NAV_MAIN } from "@/lib/data/nav";
import { navIcon } from "@/lib/data/nav-icons";
import { Separator } from "@/components/ui/separator";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { cn, shell } from "@/lib/utils";
import { FestiveBanner } from "@/features/festive";
import { NAV_LINK, ICON_BTN } from "./header-styles";
import { NavActiveLink } from "./nav-active-link";
import { CategoryMenu } from "./category-menu";
import { UserMenu } from "./user-menu";
import { CartSheet } from "./cart-sheet";
import { MobileNav } from "./mobile-nav";

const MAIN_LINKS = NAV_MAIN.filter((n) => n.href !== "/shop");

/**
 * Header — Server Component.
 *
 * پوسته، لوگو، ساختار نوار و لینک‌ها روی سرور رندر می‌شوند و هیچ JS به مرورگر
 * نمی‌فرستند. فقط این جزیره‌ها client هستند و هر کدام دلیل مشخصی دارد:
 *
 *   CategoryMenu   → NavigationMenuTrigger باز/بسته می‌شود + حالت active
 *   NavActiveLink  → usePathname برای data-[active]
 *   UserMenu       → useStore (ورود / منوی حساب)
 *   CartSheet      → Sheet باز/بسته می‌شود
 *   MobileNav      → Sheet + Accordion
 *   ModeToggle     → useTheme
 *   FestiveBanner  → انتخاب بنر بر اساس تاریخ
 */
export function Header() {
  return (
    <header dir="rtl" className="fixed inset-x-0 top-0 z-[70]">
      <FestiveBanner />

      <div
        className={cn(
          "border-b border-navy/10 bg-cream shadow-[0_8px_24px_-16px_rgba(14,42,71,.2)]",
          "dark:border-gold/20 dark:bg-navy-deep/55 dark:backdrop-blur-xl",
        )}
      >
        <div className={cn(shell, "flex h-14 items-center gap-1 sm:h-16 sm:gap-2")}>
          <Link href="/" className="flex shrink-0 items-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo.png"
              alt="لوگوی ملی‌کیدز"
              width={36}
              height={36}
              className="size-8 object-contain sm:size-9 dark:hidden"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-white.png"
              alt=""
              aria-hidden
              width={36}
              height={36}
              className="hidden size-8 object-contain sm:size-9 dark:block"
            />
            <span className="hidden leading-none min-[380px]:block md:hidden lg:block">
              <span className="block font-display text-xs font-bold tracking-[0.16em] text-navy dark:text-linen">MALLI</span>
              <span className="mt-0.5 block font-display text-[10px] tracking-[0.3em] text-gold">KIDS</span>
            </span>
          </Link>

          {/* ناوبری دسکتاپ — ساختار روی سرور، فقط آیتم‌ها جزیرهٔ client */}
          <NavigationMenu
            dir="rtl"
            viewport={false}
            delayDuration={80}
            skipDelayDuration={200}
            className={cn("mx-auto hidden max-w-none min-w-0 flex-1 justify-center md:flex")}
          >
            <NavigationMenuList className="gap-0.5 lg:gap-1">
              <CategoryMenu />

              {MAIN_LINKS.map((n) => {
                const Icon = navIcon(n.icon);
                return (
                  <NavigationMenuItem key={n.href}>
                    <NavActiveLink href={n.href} className={NAV_LINK}>
                      <Icon className="size-4 text-current" />
                      {n.label}
                    </NavActiveLink>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>

          {/* خوشهٔ اکشن‌ها */}
          <div className="ms-auto flex shrink-0 items-center gap-0.5 sm:gap-1 md:gap-0.5 lg:gap-1">
            <UserMenu />

            <Separator
              orientation="vertical"
              className="mx-0.5 hidden !h-6 bg-navy/10 min-[400px]:block md:hidden lg:block dark:bg-gold/20"
            />

            <ModeToggle className={ICON_BTN} />
            <CartSheet />
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}

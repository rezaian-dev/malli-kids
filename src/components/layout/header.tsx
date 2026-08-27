"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ChevronDown, LayoutGrid, LogIn, LogOut, Menu, Phone, Truck, User } from "lucide-react";
import { CAT_LINKS, NAV_MAIN } from "@/lib/data/nav";
import { navIcon } from "@/lib/nav-icons";
import { useStore } from "@/lib/store";
import { fullName, givenName } from "@/lib/format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle";
import { cn, shell } from "@/lib/utils";
import { FestiveBanner } from "./festive-banner";

/** پایهٔ لینک‌های ناوبری دسکتاپ (روی NavigationMenuLink سوار می‌شود). */
const NAV_LINK = cn(
  "flex-row items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition-colors",
  "text-navy/80 hover:bg-gold/10 hover:text-gold focus:bg-gold/10 focus:text-gold",
  "data-[active=true]:bg-gold data-[active=true]:text-navy-deep data-[active=true]:hover:bg-gold data-[active=true]:hover:text-navy-deep",
  "lg:px-3 lg:text-sm xl:px-4",
  "dark:text-ivory dark:hover:bg-gold/15 dark:hover:text-gold-light dark:focus:bg-gold/15 dark:focus:text-gold-light",
  "dark:data-[active=true]:bg-gold dark:data-[active=true]:text-navy-deep dark:data-[active=true]:hover:text-navy-deep",
);

/** دکمه‌های آیکونی هدر — هم‌اندازه و هماهنگ در هر دو تم. */
const ICON_BTN = cn(
  "size-9 rounded-full text-navy hover:bg-gold/12 hover:text-gold sm:size-10",
  "focus-visible:ring-2 focus-visible:ring-gold/60",
  "dark:text-gold-soft dark:hover:bg-gold/20 dark:hover:text-gold-light",
);

function Face({ src, letter, className }: { src?: string; letter: string; className?: string }) {
  return (
    <Avatar className={cn("ring-2 ring-gold dark:ring-gold-soft", className)}>
      <AvatarImage src={src} alt="" />
      <AvatarFallback className="bg-navy font-black text-gold-soft dark:bg-dusk-alt">{letter}</AvatarFallback>
    </Avatar>
  );
}

export function Header() {
  const path = usePathname();
  const { user, setAuthOpen, logout } = useStore();

  function navOn(href: string) {
    if (href === "/shop") return path === "/shop" || path.startsWith("/shop");
    return path === href || path.startsWith(`${href}/`);
  }

  const first = user ? givenName(user.firstName) : "";
  const name = user ? fullName(user.firstName, user.lastName) : "";
  const catOn = navOn("/shop");
  const mainLinks = NAV_MAIN.filter((n) => n.href !== "/shop");

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
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-1.5">
            <img
              src="/brand/logo.png"
              alt="لوگوی ملی‌کیدز"
              width={36}
              height={36}
              className="size-8 object-contain sm:size-9 dark:hidden"
            />
            <img
              src="/brand/logo-white.png"
              alt=""
              aria-hidden
              width={36}
              height={36}
              className="hidden size-8 object-contain sm:size-9 dark:block"
            />
            <span className="hidden leading-none min-[360px]:block md:hidden lg:block">
              <span className="block font-display text-xs font-bold tracking-[0.16em] text-navy dark:text-linen">MALLI</span>
              <span className="mt-0.5 block font-display text-[8px] tracking-[0.32em] text-gold">KIDS</span>
            </span>
          </Link>

          {/* ناوبری دسکتاپ — viewport={false} تا پنل بدون پرش زیر همان آیتم باز شود */}
          <NavigationMenu
            dir="rtl"
            viewport={false}
            delayDuration={80}
            skipDelayDuration={200}
            className={cn("mx-auto hidden max-w-none min-w-0 flex-1 justify-center md:flex")}
          >
            <NavigationMenuList className="gap-1">
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    "h-auto gap-1.5 rounded-full bg-transparent px-3 py-2 text-xs font-medium transition-colors lg:text-sm xl:px-4",
                    "text-navy/80 hover:bg-gold/10 hover:text-gold focus:bg-gold/10 focus:text-gold",
                    "data-[state=open]:bg-gold/10 data-[state=open]:text-gold",
                    "dark:text-ivory dark:hover:bg-gold/15 dark:hover:text-gold-light",
                    "dark:data-[state=open]:bg-gold/15 dark:data-[state=open]:text-gold-light",
                    catOn &&
                      cn(
                        "bg-gold text-navy-deep hover:bg-gold hover:text-navy-deep focus:bg-gold focus:text-navy-deep",
                        "data-[state=open]:bg-gold data-[state=open]:text-navy-deep",
                        "dark:bg-gold dark:text-navy-deep dark:hover:bg-gold dark:hover:text-navy-deep",
                        "dark:data-[state=open]:bg-gold dark:data-[state=open]:text-navy-deep",
                      ),
                  )}
                >
                  <LayoutGrid className="size-4 text-current" />
                  دسته‌بندی
                </NavigationMenuTrigger>

                <NavigationMenuContent
                  className={cn(
                    "start-0 end-auto z-[80] p-0",
                    "overflow-hidden rounded-2xl border border-navy/10 bg-paper shadow-xl",
                    "dark:border-gold/25 dark:bg-dusk",
                    "[&_svg]:text-current",
                  )}
                >
                  <div className="w-[min(34rem,calc(100vw-1.5rem))]">
                    <div className="flex items-center justify-between bg-linear-to-l from-navy to-navy-mid px-4 py-3">
                      <p className="m-0 text-sm font-black text-cream">دسته‌بندی کالکشن</p>
                      <Badge className="rounded-full border-0 bg-gold/20 text-[10px] font-bold text-gold">
                        {CAT_LINKS.length.toLocaleString("fa-IR")} دسته فعال
                      </Badge>
                    </div>

                    <ul className="grid grid-cols-2 gap-2 p-3">
                      {CAT_LINKS.map((c) => {
                        const Icon = navIcon(c.icon);
                        return (
                          <li key={c.href}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={c.href}
                                className={cn(
                                  "group flex flex-row items-center gap-3 rounded-2xl border p-3 transition-colors",
                                  "border-navy/8 bg-sand hover:border-gold/50 hover:bg-gold-pale focus:border-gold/50 focus:bg-gold-pale",
                                  "dark:border-gold/20 dark:bg-dusk-alt dark:hover:border-gold/60 dark:hover:bg-dusk-mid dark:focus:bg-dusk-mid",
                                )}
                              >
                                <span
                                  className={cn(
                                    "flex size-10 shrink-0 items-center justify-center rounded-2xl transition-colors",
                                    "bg-navy text-gold group-hover:bg-navy-mid",
                                    "dark:bg-gold dark:text-navy-deep dark:group-hover:bg-gold-light",
                                  )}
                                >
                                  <Icon className="size-5 text-current" />
                                </span>
                                <span className="min-w-0">
                                  <span className="block text-sm font-black text-navy dark:text-ivory">{c.label}</span>
                                  <span className="mt-0.5 block text-[11px] font-normal text-navy/45 dark:text-wheat/80">{c.hint}</span>
                                </span>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        );
                      })}
                    </ul>

                    <div className="px-3 pb-3">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/shop"
                          className={cn(
                            "flex flex-row items-center justify-center gap-2 rounded-2xl py-3 text-xs font-black transition-colors",
                            "bg-navy text-cream hover:bg-navy-mid",
                            "dark:bg-gold dark:text-navy-deep dark:hover:bg-gold-light",
                          )}
                        >
                          مشاهده همه‌ی دسته‌بندی‌ها <ArrowLeft className="size-4 text-current" />
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* هر آیتم ناوبری با آیکون مربوط به خودش */}
              {mainLinks.map((n) => {
                const Icon = navIcon(n.icon);
                return (
                  <NavigationMenuItem key={n.href}>
                    <NavigationMenuLink asChild active={navOn(n.href)} className={NAV_LINK}>
                      <Link href={n.href}>
                        <Icon className="size-4 text-current" />
                        {n.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>

          {/* خوشهٔ اکشن‌ها */}
          <div className="ms-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
            {user ? (
              <DropdownMenu dir="rtl" modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "group h-9 gap-1.5 rounded-full px-1 sm:h-10 sm:pe-3",
                      "border-gold/55 bg-white hover:border-gold hover:bg-white",
                      "focus-visible:ring-2 focus-visible:ring-gold/60",
                      "dark:border-gold/45 dark:bg-dusk dark:hover:border-gold dark:hover:bg-dusk",
                    )}
                  >
                    <Face src={user.avatar} letter={first.charAt(0)} className="size-7 text-xs sm:size-8" />
                    <span className="hidden max-w-20 truncate text-xs font-extrabold text-navy min-[360px]:inline dark:text-linen">{first}</span>
                    <ChevronDown className="hidden size-3.5 text-gold transition-transform min-[360px]:block group-data-[state=open]:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  sideOffset={12}
                  className={cn(
                    "z-[80] w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-[22px] border border-gold bg-paper p-0",
                    "dark:border-gold/50 dark:bg-dusk",
                  )}
                >
                  <div className="flex items-center gap-3 border-b border-gold bg-linear-to-br from-navy to-navy-mid px-4 py-3.5 dark:border-gold/40">
                    <Face src={user.avatar} letter={first.charAt(0)} className="size-12 text-lg" />
                    <div className="min-w-0">
                      <p className="m-0 truncate text-[15px] font-black text-white">{name}</p>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-bold text-gold-soft">
                        <Phone className="size-3.5" />
                        <span dir="ltr">{user.phone?.trim() || "شماره ثبت نشده"}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col px-3 py-2">
                    <DropdownMenuItem asChild className="rounded-[10px] py-2.5 font-bold">
                      <Link href="/profile">
                        <User className="size-4 text-gold" /> حساب کاربری من
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-[10px] py-2.5 font-bold">
                      <Link href="/profile#orders">
                        <Truck className="size-4 text-gold" /> پیگیری سفارشات
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" className="rounded-[10px] py-2.5 font-bold" onSelect={() => logout()}>
                      <LogOut className="size-4" /> خروج از حساب
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => setAuthOpen(true)}
                className={cn(
                  "h-9 gap-1 rounded-full border-2 border-gold bg-gold px-2 text-xs font-extrabold text-navy-deep hover:bg-gold-light sm:h-10 sm:px-3.5",
                  "focus-visible:ring-2 focus-visible:ring-gold/60",
                )}
              >
                <LogIn className="size-4" />
                <span className="min-[360px]:hidden">ورود</span>
                <span className="hidden min-[360px]:inline">ورود | ثبت‌نام</span>
              </Button>
            )}

            <Separator orientation="vertical" className="mx-0.5 hidden !h-6 bg-navy/10 min-[360px]:block sm:mx-1 dark:bg-gold/20" />

            <ModeToggle className={ICON_BTN} />

            {/* منوی موبایل — کاملاً با Sheet + Accordion، بدون state دستی */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="منو" className={cn(ICON_BTN, "md:hidden")}>
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                dir="rtl"
                className={cn(
                  "z-[90] w-[min(20rem,90vw)] gap-0 border-navy/10 bg-cream p-0",
                  "dark:border-gold/20 dark:bg-navy-deep",
                )}
              >
                <SheetHeader className="border-b border-navy/10 bg-linear-to-l from-navy to-navy-mid px-4 py-4 dark:border-gold/20">
                  <SheetTitle className="text-start text-sm font-black text-cream">منوی ملی‌کیدز</SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col overflow-y-auto px-3 py-2">
                  <SheetClose asChild>
                    <Link
                      href="/shop"
                      className="flex items-center gap-2 border-b border-navy/5 px-2 py-3 text-sm font-bold text-navy dark:border-gold/10 dark:text-ivory"
                    >
                      <LayoutGrid className="size-4 text-gold" /> دسته‌بندی محصولات
                    </Link>
                  </SheetClose>

                  <Accordion type="single" collapsible className="border-b border-navy/5 dark:border-gold/10">
                    <AccordionItem value="cats" className="border-0">
                      <AccordionTrigger className="px-2 py-3 text-sm font-bold text-navy hover:no-underline dark:text-ivory">
                        <span className="flex items-center gap-2">
                          <LayoutGrid className="size-4 text-gold" /> زیردسته‌ها
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-2 ps-6">
                        <div className="flex flex-col">
                          {CAT_LINKS.map((c) => {
                            const Icon = navIcon(c.icon);
                            return (
                              <SheetClose asChild key={c.href}>
                                <Link href={c.href} className="flex items-center gap-2 py-2.5 text-sm text-navy/70 dark:text-wheat">
                                  <Icon className="size-4 text-gold/80 dark:text-gold" /> {c.label}
                                </Link>
                              </SheetClose>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {mainLinks.map((n) => {
                    const Icon = navIcon(n.icon);
                    return (
                      <SheetClose asChild key={n.href}>
                        <Link
                          href={n.href}
                          className={cn(
                            "flex items-center gap-2 border-b border-navy/5 px-2 py-3 text-sm font-bold text-navy last:border-0",
                            "dark:border-gold/10 dark:text-ivory",
                            navOn(n.href) && "text-gold dark:text-gold-light",
                          )}
                        >
                          <Icon className="size-4 text-gold" /> {n.label}
                        </Link>
                      </SheetClose>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

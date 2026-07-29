"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Menu, X } from "lucide-react";
import { CAT_LINKS, NAV_MAIN } from "@/lib/data/nav";
import { navIcon } from "@/lib/data/nav-icons";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ICON_BTN, PANEL, PANEL_HEAD } from "./header-styles";
import { isActive } from "./nav-active-link";

const MAIN_LINKS = NAV_MAIN.filter((n) => n.href !== "/shop");

export function MobileNav() {
  const path = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="منو"
          className={cn(
            ICON_BTN,
            "group/menu hover:bg-gold/15 relative md:hidden",
            "aria-expanded:bg-gold/25 aria-expanded:text-gold-deep dark:aria-expanded:text-gold-light",
          )}
        >
          <Menu
            className={cn(
              "size-5",
              "transition-all duration-300 ease-out",
              "group-aria-expanded/menu:scale-0 group-aria-expanded/menu:-rotate-90 group-aria-expanded/menu:opacity-0",
            )}
          />
          <X
            className={cn(
              "absolute inset-0 m-auto size-5",
              "scale-0 rotate-90 opacity-0 transition-all duration-300 ease-out",
              "group-aria-expanded/menu:scale-100 group-aria-expanded/menu:rotate-0 group-aria-expanded/menu:opacity-100",
            )}
          />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        dir="rtl"
        showCloseButton={false}
        className={cn(PANEL, "w-[min(20rem,90vw)]")}
      >
        <SheetHeader className={cn(PANEL_HEAD, "relative py-4 pe-14")}>
          <SheetClose
            asChild
            className="absolute inset-e-3.5 top-1/2 -translate-y-1/2"
          >
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="بستن منو"
              className={cn(
                "rounded-full transition-transform duration-300 ease-out",
                "text-cream hover:text-gold-light hover:scale-105 hover:bg-white/15",
              )}
            >
              <X className="size-5 text-current" />
            </Button>
          </SheetClose>
          <SheetTitle className="text-cream text-start text-sm font-black">
            منوی ملی‌کیدز
          </SheetTitle>
        </SheetHeader>

        <nav
          aria-label="منوی موبایل"
          className="flex flex-col overflow-y-auto px-3 py-2"
        >
          <SheetClose asChild>
            <Link
              href="/shop"
              className={cn(
                "flex items-center gap-2 px-2 py-3",
                "border-navy/5 text-navy border-b text-sm font-bold",
                "dark:border-gold/10 dark:text-ivory",
              )}
            >
              <LayoutGrid className="text-gold size-4" /> دسته‌بندی محصولات
            </Link>
          </SheetClose>

          <Accordion
            type="single"
            collapsible
            className="border-navy/5 dark:border-gold/10 border-b"
          >
            <AccordionItem value="cats" className="border-0">
              <AccordionTrigger
                className={cn(
                  "px-2 py-3",
                  "text-navy text-sm font-bold hover:no-underline",
                  "dark:text-ivory",
                )}
              >
                <span className="flex items-center gap-2">
                  <LayoutGrid className="text-gold size-4" /> زیردسته‌ها
                </span>
              </AccordionTrigger>
              <AccordionContent className="ps-6 pb-2">
                <div className="flex flex-col">
                  {CAT_LINKS.map((c) => {
                    const Icon = navIcon(c.icon);
                    return (
                      <SheetClose asChild key={c.href}>
                        <Link
                          href={c.href}
                          className="text-navy/70 dark:text-wheat flex items-center gap-2 py-2.5 text-sm"
                        >
                          <span
                            className={cn(
                              "grid size-7 shrink-0 place-items-center rounded-lg",
                              c.swatch,
                            )}
                          >
                            <Icon className="size-3.5 text-current" />
                          </span>
                          {c.label}
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {MAIN_LINKS.map((n) => {
            const Icon = navIcon(n.icon);
            return (
              <SheetClose asChild key={n.href}>
                <Link
                  href={n.href}
                  className={cn(
                    "flex items-center gap-2 px-2 py-3 last:border-0",
                    "border-navy/5 text-navy border-b text-sm font-bold",
                    "dark:border-gold/10 dark:text-ivory",
                    isActive(path, n.href) && "text-gold dark:text-gold-light",
                  )}
                >
                  <Icon className="text-gold size-4" /> {n.label}
                </Link>
              </SheetClose>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Menu } from "lucide-react";
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

/** منوی موبایل (زیر ۷۶۸px) — Sheet + Accordion، بدون state دستی. */
export function MobileNav() {
  const path = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="منو" className={cn(ICON_BTN, "md:hidden")}>
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" dir="rtl" className={cn(PANEL, "w-[min(20rem,90vw)]")}>
        <SheetHeader className={cn(PANEL_HEAD, "py-4")}>
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

          {MAIN_LINKS.map((n) => {
            const Icon = navIcon(n.icon);
            return (
              <SheetClose asChild key={n.href}>
                <Link
                  href={n.href}
                  className={cn(
                    "flex items-center gap-2 border-b border-navy/5 px-2 py-3 text-sm font-bold text-navy last:border-0",
                    "dark:border-gold/10 dark:text-ivory",
                    isActive(path, n.href) && "text-gold dark:text-gold-light",
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
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import { CAT_LINKS } from "@/lib/data/nav";
import { navIcon } from "@/lib/data/nav-icons";
import { Badge } from "@/components/ui/badge";
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { isActive } from "./nav-active-link";
import { startTopProgress } from "./click-progress";

/**
 * آیتم «دسته‌بندی» نوار ناوبری.
 * client است چون NavigationMenuTrigger باز/بسته می‌شود و حالت active به مسیر وابسته است.
 */
export function CategoryMenu() {
  const path = usePathname();
  const router = useRouter();
  const catOn = isActive(path, "/shop");

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger
        // هاور = باز شدنِ منو؛ کلیک = رفتن به صفحهٔ لیستِ محصولات
        onClick={() => {
          startTopProgress();
          router.push("/shop");
        }}
        className={cn(
          "h-auto cursor-pointer gap-1 rounded-full bg-transparent px-2 py-2 text-[11px] font-medium transition-colors lg:gap-1.5 lg:px-3 lg:text-sm xl:px-4",
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
          "[&_a]:text-current [&_button]:text-current [&_svg]:text-current",
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
                          "flex size-10 shrink-0 items-center justify-center rounded-2xl",
                          "bg-navy text-gold",
                          "dark:bg-gold dark:text-navy-deep",
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
            <Link
              href="/shop"
              className={cn(
                "flex flex-row items-center justify-center gap-2 rounded-2xl border-0 py-3.5 text-sm font-black no-underline transition-all",
                "bg-gold text-navy-deep shadow-[0_4px_14px_-4px_rgba(193,147,87,.5)] hover:bg-gold-light hover:shadow-[0_6px_20px_-4px_rgba(193,147,87,.7)]",
              )}
              onClick={() => { startTopProgress(); }}
            >
              مشاهده همه‌ی دسته‌بندی‌ها <ArrowLeft className="size-4 text-current" />
            </Link>
          </div>
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

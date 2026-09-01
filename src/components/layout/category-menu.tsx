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

export function CategoryMenu() {
  const path = usePathname();
  const router = useRouter();
  const catOn = isActive(path, "/shop");

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger
        onClick={() => {
          startTopProgress();
          router.push("/shop");
        }}
        className={cn(
          "h-auto cursor-pointer gap-1 px-2 py-2 lg:gap-1.5 lg:px-3 xl:px-4",
          "rounded-full bg-transparent text-[11px] font-medium transition-colors lg:text-sm",
          "text-navy/80 hover:bg-gold/10 hover:text-gold focus:bg-gold/10 focus:text-gold",
          "data-open:bg-gold/10 data-open:text-gold",
          "dark:text-ivory dark:hover:bg-gold/15 dark:hover:text-gold-light",
          "dark:data-open:bg-gold/15 dark:data-open:text-gold-light",
          catOn &&
            cn(
              "bg-gold text-navy-deep hover:bg-gold hover:text-navy-deep focus:bg-gold focus:text-navy-deep",
              "data-open:bg-gold data-open:text-navy-deep",
              "dark:bg-gold dark:text-navy-deep dark:hover:bg-gold dark:hover:text-navy-deep",
              "dark:data-open:bg-gold dark:data-open:text-navy-deep",
            ),
        )}
      >
        <LayoutGrid className="size-4 text-current" />
        دسته‌بندی
      </NavigationMenuTrigger>

      <NavigationMenuContent
        className={cn(
          "inset-s-0 inset-e-auto z-80 p-0",
          "border-navy/10 bg-paper overflow-hidden rounded-2xl border shadow-xl",
          "dark:border-gold/25 dark:bg-dusk",
          "[&_a]:text-current [&_button]:text-current [&_svg]:text-current",
        )}
      >
        <div className="w-[min(34rem,calc(100vw-1.5rem))]">
          <div
            className={cn(
              "flex items-center justify-between px-4 py-3",
              "from-navy to-navy-mid bg-linear-to-l",
            )}
          >
            <p className="text-cream m-0 text-sm font-black">
              دسته‌بندی کالکشن
            </p>
            <Badge className="bg-gold/20 text-gold rounded-full border-0 text-[10px] font-bold">
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
                        "group flex flex-row items-center gap-3 p-3",
                        "border-navy/8 bg-sand hover:border-gold/50 hover:bg-gold-pale focus:border-gold/50 focus:bg-gold-pale rounded-2xl border transition-colors",
                        "dark:border-gold/20 dark:bg-dusk-alt dark:hover:border-gold/60 dark:hover:bg-dusk-mid dark:focus:bg-dusk-mid",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center",
                          "rounded-2xl transition-[transform,box-shadow] duration-300",
                          "group-hover:scale-105",
                          c.swatch,
                        )}
                      >
                        <Icon className="size-5 text-current" />
                      </span>
                      <span className="min-w-0">
                        <span className="text-navy dark:text-ivory block text-sm font-black">
                          {c.label}
                        </span>
                        <span className="text-navy/70 dark:text-wheat/80 mt-0.5 block text-[11px] font-normal">
                          {c.hint}
                        </span>
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
                "flex flex-row items-center justify-center gap-2 py-3.5",
                "rounded-2xl border-0 text-sm font-black no-underline transition-all",
                "bg-gold text-navy-deep hover:bg-gold-light shadow-[0_4px_14px_-4px_rgba(193,147,87,.5)] hover:shadow-[0_6px_20px_-4px_rgba(193,147,87,.7)]",
              )}
              onClick={() => {
                startTopProgress();
              }}
            >
              مشاهده همه‌ی دسته‌بندی‌ها{" "}
              <ArrowLeft className="size-4 text-current" />
            </Link>
          </div>
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

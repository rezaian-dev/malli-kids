"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { NAV_MAIN } from "@/lib/data/nav";
import { navIcon } from "@/lib/data/nav-icons";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { CategoryMenu } from "./category-menu";
import { NavActiveLink } from "./nav-active-link";
import { NAV_LINK } from "./header-styles";

const MAIN_LINKS = NAV_MAIN.filter((n) => n.href !== "/shop");

export function DesktopNav() {
  const path = usePathname();
  const [value, setValue] = useState("");

  // 🧭 Close the open menu as soon as the route changes.
  useEffect(() => {
    setValue("");
  }, [path]);

  return (
    <NavigationMenu
      dir="rtl"
      viewport={false}
      delayDuration={60}
      skipDelayDuration={120}
      value={value}
      onValueChange={setValue}
      aria-label="منوی اصلی"
      className="mx-auto hidden max-w-none min-w-0 flex-1 justify-center md:flex"
    >
      <NavigationMenuList className="gap-0.5 lg:gap-1">
        <CategoryMenu />

        {MAIN_LINKS.map((n) => {
          const Icon = navIcon(n.icon);
          return (
            <NavigationMenuItem key={n.href}>
              <NavigationMenuLink asChild>
                <NavActiveLink href={n.href} className={NAV_LINK}>
                  <Icon className="size-4 text-current" />
                  {n.label}
                </NavActiveLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

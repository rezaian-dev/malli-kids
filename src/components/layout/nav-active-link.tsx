"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

/** آیا مسیر فعلی زیرمجموعهٔ این href است؟ */
export function isActive(path: string, href: string) {
  if (href === "/shop") return path === "/shop" || path.startsWith("/shop");
  return path === href || path.startsWith(`${href}/`);
}

/**
 * تنها دلیل client بودن: usePathname برای حالت active.
 * فقط همین لینک هیدریت می‌شود، نه کل نوار ناوبری.
 */
export function NavActiveLink({
  href,
  className,
  children,
  ...props
}: { href: string } & Omit<ComponentProps<typeof Link>, "href">) {
  const path = usePathname();

  return (
    <NavigationMenuLink asChild active={isActive(path, href)} className={className}>
      <Link href={href} {...props}>
        {children}
      </Link>
    </NavigationMenuLink>
  );
}

/** نسخهٔ ساده برای منوی موبایل (بدون NavigationMenuLink). */
export function MobileActiveLink({
  href,
  className,
  activeClassName,
  children,
  ...props
}: {
  href: string;
  activeClassName?: string;
} & Omit<ComponentProps<typeof Link>, "href">) {
  const path = usePathname();

  return (
    <Link href={href} className={cn(className, isActive(path, href) && activeClassName)} {...props}>
      {children}
    </Link>
  );
}

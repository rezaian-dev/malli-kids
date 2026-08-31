"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export function isActive(path: string, href: string) {
  if (href === "/shop") return path === "/shop" || path.startsWith("/shop");
  return path === href || path.startsWith(`${href}/`);
}

export function NavActiveLink({
  href,
  className,
  children,
  prefetch = false,
  ...props
}: { href: string } & Omit<ComponentProps<typeof Link>, "href">) {
  const path = usePathname();

  return (
    <NavigationMenuLink
      asChild
      active={isActive(path, href)}
      className={className}
    >
      <Link href={href} prefetch={prefetch} {...props}>
        {children}
      </Link>
    </NavigationMenuLink>
  );
}

export function MobileActiveLink({
  href,
  className,
  activeClassName,
  children,
  prefetch = false,
  ...props
}: {
  href: string;
  activeClassName?: string;
} & Omit<ComponentProps<typeof Link>, "href">) {
  const path = usePathname();

  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={cn(className, isActive(path, href) && activeClassName)}
      {...props}
    >
      {children}
    </Link>
  );
}

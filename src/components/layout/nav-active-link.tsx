"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";

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
  const active = isActive(path, href);

  return (
    <NavigationMenuLink asChild active={active} className={className}>
      <Link
        href={href}
        prefetch={prefetch}
        aria-current={active ? "page" : undefined}
        {...props}
      >
        {children}
      </Link>
    </NavigationMenuLink>
  );
}

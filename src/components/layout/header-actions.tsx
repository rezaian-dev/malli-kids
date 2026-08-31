"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Bell, Menu, ShoppingBag, SunMoon, UserRound } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ICON_BTN } from "./header-styles";

function ActionGhostFallback({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span aria-hidden className={cn(ICON_BTN, "inline-flex", className)}>
      {children}
    </span>
  );
}

function ActionLinkFallback({
  href,
  label,
  className,
  children,
}: {
  href: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      aria-label={label}
      className={cn(ICON_BTN, "inline-flex", className)}
    >
      {children}
    </Link>
  );
}

const UserMenu = dynamic(() => import("./user-menu").then((mod) => mod.UserMenu), {
  ssr: false,
  loading: () => (
    <ActionLinkFallback href="/profile" label="حساب کاربری">
      <UserRound className="size-5" />
    </ActionLinkFallback>
  ),
});
const ModeToggle = dynamic(
  () => import("@/components/shared/mode-toggle").then((mod) => mod.ModeToggle),
  {
    ssr: false,
    loading: () => (
      <ActionGhostFallback>
        <SunMoon className="size-5" />
      </ActionGhostFallback>
    ),
  },
);
const NoticesBell = dynamic(
  () => import("./notices-bell").then((mod) => mod.NoticesBell),
  {
    ssr: false,
    loading: () => (
      <ActionGhostFallback>
        <Bell className="size-5" />
      </ActionGhostFallback>
    ),
  },
);
const CartSheet = dynamic(() => import("./cart-sheet").then((mod) => mod.CartSheet), {
  ssr: false,
  loading: () => (
    <ActionLinkFallback href="/shop" label="سبد خرید">
      <ShoppingBag className="size-5" />
    </ActionLinkFallback>
  ),
});
const MobileNav = dynamic(() => import("./mobile-nav").then((mod) => mod.MobileNav), {
  ssr: false,
  loading: () => (
    <ActionLinkFallback href="/shop" label="منو" className="md:hidden">
      <Menu className="size-5" />
    </ActionLinkFallback>
  ),
});

// ⚡ Hydrate header actions only when the browser is ready.
export function HeaderActions() {
  return (
    <div className="ms-auto flex shrink-0 items-center gap-1.5 min-[360px]:gap-2 md:gap-1.5 lg:gap-2">
      <UserMenu />

      <Separator
        orientation="vertical"
        className="bg-navy/15 dark:bg-gold/25 mx-1 hidden h-5! w-px data-vertical:self-center min-[480px]:block md:hidden lg:block"
      />

      <ModeToggle className={ICON_BTN} />
      <NoticesBell />
      <CartSheet />
      <MobileNav />
    </div>
  );
}

"use client";

import { Bell, ChevronDown, LogIn } from "lucide-react";
import { useStore } from "@/providers/store-provider";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ICON_BTN } from "./header-styles";
import { UserMenu } from "./user-menu";
import { NoticesBell } from "./notices-bell";
import { CartSheet } from "./cart-sheet";
import { MobileNav } from "./mobile-nav";

function GuestButtonFallback() {
  return (
    <Button
      type="button"
      aria-hidden
      tabIndex={-1}
      className="pointer-events-none h-full shrink-0 gap-1.5 rounded-full border-2 border-gold bg-gold px-2.5 text-[11px] font-extrabold text-navy-deep min-[400px]:px-3 min-[400px]:text-xs md:px-2.5 lg:px-4"
    >
      <LogIn className="size-4 shrink-0" />
      <span className="whitespace-nowrap">
        ورود
        <span className="hidden min-[360px]:inline"> | ثبت‌نام</span>
      </span>
    </Button>
  );
}

function UserButtonSkeleton() {
  return (
    <Button
      type="button"
      variant="outline"
      aria-hidden
      tabIndex={-1}
      className="pointer-events-none relative h-full min-w-0 shrink-0 gap-1.5 rounded-full border border-gold/55 bg-white px-1 sm:pe-3 md:pe-1 lg:pe-3 dark:border-gold/45 dark:bg-dusk"
    >
      <span className="size-7 shrink-0 rounded-full opacity-0 ring-2 ring-gold sm:size-8" />
      <span className="hidden max-w-20 truncate text-xs font-extrabold opacity-0 min-[480px]:inline md:hidden lg:inline">
        ملی‌کیدز
      </span>
      <ChevronDown className="hidden size-3.5 opacity-0 min-[480px]:block md:hidden lg:block" />
      <Skeleton className="absolute inset-0 rounded-full" />
    </Button>
  );
}

function BellButtonSkeleton() {
  return (
    <Button
      type="button"
      size="icon"
      aria-hidden
      tabIndex={-1}
      className={`${ICON_BTN} pointer-events-none relative border-2 border-gold/70 bg-gold/12 text-navy dark:border-gold/60 dark:bg-gold/15 dark:text-gold-soft`}
    >
      <Bell className="size-5 opacity-0" />
      <Skeleton className="absolute inset-0 rounded-full" />
    </Button>
  );
}

function GuestHeaderShell() {
  return (
    <div
      data-shell="guest"
      className="header-account-shell flex h-9 items-center justify-end min-[360px]:h-10 md:h-9 lg:h-10"
    >
      <GuestButtonFallback />
    </div>
  );
}

function UserHeaderShell() {
  return (
    <div
      data-shell="user"
      className="header-account-shell hidden h-9 items-center justify-end gap-1.5 min-[360px]:h-10 md:h-9 lg:h-10"
    >
      <UserButtonSkeleton />
      <BellButtonSkeleton />
    </div>
  );
}

function HeaderAccountFallback() {
  return (
    <>
      <GuestHeaderShell />
      <UserHeaderShell />
    </>
  );
}

function HeaderAccountLive() {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <UserMenu />
      <NoticesBell />
    </div>
  );
}

function HeaderAccountSlot() {
  const { ready } = useStore();

  return (
    <div className="flex h-9 min-w-[7.25rem] shrink-0 items-center justify-end min-[360px]:h-10 min-[360px]:min-w-[9.5rem] min-[400px]:min-w-[12.25rem] md:h-9 md:min-w-[6.75rem] lg:h-10 lg:min-w-[12.25rem]">
      {ready ? <HeaderAccountLive /> : <HeaderAccountFallback />}
    </div>
  );
}

// ⚡ Keep the header silhouette fixed while auth state hydrates. ✨
export function HeaderActions() {
  return (
    <div className="ms-auto flex shrink-0 items-center gap-1.5 min-[360px]:gap-2 md:gap-1.5 lg:gap-2">
      <HeaderAccountSlot />

      <Separator
        orientation="vertical"
        className="mx-1 hidden h-5! w-px bg-navy/15 data-vertical:self-center min-[480px]:block dark:bg-gold/25 md:hidden lg:block"
      />

      <ModeToggle className={ICON_BTN} />
      <CartSheet />
      <MobileNav />
    </div>
  );
}

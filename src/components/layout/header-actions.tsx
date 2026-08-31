"use client";

import { useStore } from "@/providers/store-provider";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ICON_BTN } from "./header-styles";
import { UserMenu } from "./user-menu";
import { NoticesBell } from "./notices-bell";
import { CartSheet } from "./cart-sheet";
import { MobileNav } from "./mobile-nav";

function GuestHeaderShell() {
  return (
    <div
      data-shell="guest"
      className="header-account-shell flex h-9 w-full items-center justify-end min-[360px]:h-10 md:h-9 lg:h-10"
    >
      <Skeleton className="h-full w-full rounded-full" />
    </div>
  );
}

function UserHeaderShell() {
  return (
    <div
      data-shell="user"
      className="header-account-shell hidden h-9 w-full items-center justify-end gap-1.5 min-[360px]:h-10 md:h-9 lg:h-10"
    >
      <Skeleton className="h-full min-w-0 flex-1 rounded-full" />
      <Skeleton className="size-9 rounded-full min-[360px]:size-10 md:size-9 lg:size-10" />
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
    <div className="flex w-full items-center justify-end gap-1.5">
      <UserMenu />
      <NoticesBell />
    </div>
  );
}

function HeaderAccountSlot() {
  const { ready } = useStore();

  return (
    <div className="flex h-9 w-[7.25rem] shrink-0 items-center justify-end min-[360px]:h-10 min-[360px]:w-[9.5rem] min-[400px]:w-[12.25rem] md:h-9 md:w-[6.75rem] lg:h-10 lg:w-[12.25rem]">
      {ready ? <HeaderAccountLive /> : <HeaderAccountFallback />}
    </div>
  );
}

// ⚡ Keep the header width and silhouettes stable while state wakes up. ✨
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

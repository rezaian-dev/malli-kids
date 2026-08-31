"use client";

import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { ICON_BTN } from "./header-styles";
import { UserMenu } from "./user-menu";
import { NoticesBell } from "./notices-bell";
import { CartSheet } from "./cart-sheet";
import { MobileNav } from "./mobile-nav";

// ⚡ Keep header actions interactive right after hydration. ✨
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

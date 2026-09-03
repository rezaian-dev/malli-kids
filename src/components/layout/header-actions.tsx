"use client";

import { ModeToggle } from "@/components/shared/mode-toggle";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ICON_BTN } from "./header-styles";
import { UserMenu } from "./user-menu";
import { NoticesBell } from "./notices-bell";
import { CartSheet } from "./cart-sheet";
import { MobileNav } from "./mobile-nav";

// 🪪 `getSessionUser()` already resolved who's signed in server-side and
// seeded `useStore()`'s `user` with it (see `app/layout.tsx`), so UserMenu
// and NoticesBell render the real, final auth UI from the very first paint
// — there's no guest/user skeleton to swap in after mount, and this no
// longer waits on the store's `ready` flag (that flag is about the cart's
// localStorage bootstrap, which has nothing to do with auth).
function HeaderAccountSlot() {
  return (
    <div className="flex h-9 min-w-29 shrink-0 items-center justify-end gap-1.5 min-[360px]:h-10 min-[360px]:min-w-38 min-[400px]:min-w-49 md:h-9 md:min-w-27 lg:h-10 lg:min-w-49">
      <UserMenu />
      <NoticesBell />
    </div>
  );
}

// ⚡ Keep the header silhouette fixed on refresh. ✨
export function HeaderActions() {
  return (
    <div className="ms-auto flex shrink-0 items-center gap-1.5 min-[360px]:gap-2 md:gap-1.5 lg:gap-2">
      <HeaderAccountSlot />

      <Separator
        orientation="vertical"
        className={cn(
          "mx-1 hidden h-5! w-px min-[480px]:block md:hidden lg:block",
          "bg-navy/15",
          "data-vertical:self-center",
          "dark:bg-gold/25",
        )}
      />

      <ModeToggle className={ICON_BTN} />
      <CartSheet />
      <MobileNav />
    </div>
  );
}

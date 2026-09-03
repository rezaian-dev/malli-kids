"use client";

import { lazy, Suspense } from "react";
import { LogIn } from "lucide-react";
import { useStore } from "@/providers/store-provider";
import { fullName, givenName } from "@/lib/text/name";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CLUSTER_H } from "./header-styles";
import { AccountFace, TRIGGER_SHELL } from "./account-trigger";

// 🎯 Radix DropdownMenu + floating-ui only ship to signed-in visitors — see
// the comment in `user-account-menu.tsx`. `Suspense` (not `next/dynamic`'s
// own `loading` option) so the fallback below can be the *real* button
// (we already know the avatar/name from the server-rendered `user`) instead
// of a content-free skeleton: nothing visibly moves or blinks while the
// dropdown's chunk streams in — only its click-ability "wakes up" a moment
// later.
const UserAccountMenu = lazy(() => import("./user-account-menu"));

export function UserMenu() {
  const { user, setAuthOpen, logout } = useStore();

  if (!user) {
    return (
      <Button
        onClick={() => setAuthOpen(true)}
        className={cn(
          CLUSTER_H,
          "shrink-0 gap-1.5 px-2.5 min-[400px]:px-3 md:px-2.5 lg:px-4",
          "border-gold bg-gold text-navy-deep hover:bg-gold-light rounded-full border-2 text-[11px] font-extrabold min-[400px]:text-xs",
          "focus-visible:ring-gold/60 focus-visible:ring-2",
        )}
      >
        <LogIn className="size-4 shrink-0" />
        <span className="whitespace-nowrap">
          ورود
          <span className="hidden min-[360px]:inline"> | ثبت‌نام</span>
        </span>
      </Button>
    );
  }

  const first = givenName(user.firstName);
  const name = fullName(user.firstName, user.lastName);

  return (
    <Suspense
      fallback={
        <div
          aria-hidden
          tabIndex={-1}
          className={cn(TRIGGER_SHELL, "pointer-events-none flex items-center")}
        >
          <AccountFace avatar={user.avatar} first={first} />
        </div>
      }
    >
      <UserAccountMenu user={user} first={first} name={name} logout={logout} />
    </Suspense>
  );
}

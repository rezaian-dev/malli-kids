"use client";

import dynamic from "next/dynamic";
import { LogIn } from "lucide-react";
import { useStore } from "@/providers/store-provider";
import { fullName, givenName } from "@/lib/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CLUSTER_H } from "./header-styles";

// 🎯 Radix DropdownMenu + floating-ui only ship to signed-in visitors —
// see the comment in `user-account-menu.tsx`. The skeleton keeps the
// header's width/height stable while that chunk streams in, so there's
// no layout shift.
const UserAccountMenu = dynamic(() => import("./user-account-menu"), {
  loading: () => (
    <div
      className={cn(
        CLUSTER_H,
        "flex shrink-0 items-center gap-1.5 rounded-full px-1 sm:pe-3 md:pe-1 lg:pe-3",
      )}
    >
      <Avatar className="ring-gold/40 size-7 shrink-0 animate-pulse ring-2 sm:size-8">
        <AvatarFallback className="bg-navy/10 dark:bg-dusk-alt/60" />
      </Avatar>
    </div>
  ),
});

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
    <UserAccountMenu user={user} first={first} name={name} logout={logout} />
  );
}

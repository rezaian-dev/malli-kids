"use client";

import { LogIn } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { fullName, givenName } from "@/lib/text/name";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CLUSTER_H } from "./header-styles";

import UserAccountMenu from "./user-account-menu";

export function UserMenu() {
  const { user, setAuthOpen, logout } = useAuth();

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

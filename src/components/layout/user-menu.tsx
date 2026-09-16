"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { authHref } from "@/lib/auth/redirect";
import { useAuth } from "@/providers/auth-provider";
import { fullName, givenName } from "@/lib/text/name";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CLUSTER_H } from "./header-styles";

import UserAccountMenu from "./user-account-menu";

export function UserMenu() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const next = `${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`;

  if (!user) {
    return (
      <Button
        asChild
        className={cn(
          CLUSTER_H,
          "shrink-0 gap-1.5 px-2.5 min-[400px]:px-3 md:px-2.5 lg:px-4",
          "border-gold bg-gold text-navy-deep hover:bg-gold-light rounded-full border-2 text-[11px] font-extrabold min-[400px]:text-xs",
          "focus-visible:ring-gold/60 focus-visible:ring-2",
        )}
      >
        <Link href={authHref(next)}>
          <LogIn className="size-4 shrink-0" />
          <span className="whitespace-nowrap">
            ورود
            <span className="hidden min-[360px]:inline"> | ثبت‌نام</span>
          </span>
        </Link>
      </Button>
    );
  }

  const first = givenName(user.firstName);
  const name = fullName(user.firstName, user.lastName);

  return (
    <UserAccountMenu user={user} first={first} name={name} logout={logout} />
  );
}

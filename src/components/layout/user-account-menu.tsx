"use client";

// 🎯 Split out of `user-menu.tsx` so the Radix DropdownMenu + floating-ui
// code (the two biggest "mostly unused on first load" JS chunks Lighthouse
// flagged) only ships to signed-in visitors, loaded on demand via
// `next/dynamic` in the parent — not parsed/evaluated on every guest
// pageview, which is the majority of storefront traffic. ✨
import Link from "next/link";
import { Heart, Headphones, LogOut, Phone, Truck, User } from "lucide-react";
import type { useStore } from "@/providers/store-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { AccountFace, Face, TRIGGER_SHELL } from "./account-trigger";

const MENU_ITEM = "rounded-[10px] py-2.5 font-bold";

export default function UserAccountMenu({
  user,
  first,
  name,
  logout,
}: {
  user: NonNullable<ReturnType<typeof useStore>["user"]>;
  first: string;
  name: string;
  logout: () => void;
}) {
  return (
    <DropdownMenu dir="rtl" modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          aria-label="حساب کاربری"
          className={TRIGGER_SHELL}
        >
          <AccountFace avatar={user.avatar} first={first} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={12}
        className={cn(
          "border-gold bg-paper z-80 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-[22px] border p-0",
          "dark:border-gold/50 dark:bg-dusk",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-3.5",
            "border-gold from-navy to-navy-mid border-b bg-linear-to-br",
            "dark:border-gold/40",
          )}
        >
          <Face
            src={user.avatar}
            letter={first.charAt(0)}
            className="size-12 text-lg"
          />
          <div className="min-w-0">
            <p className="m-0 truncate text-[15px] font-black text-white">
              {name}
            </p>
            <p
              className={cn(
                "mt-1 inline-flex items-center gap-1.5",
                "text-gold-soft text-[11px] font-bold",
              )}
            >
              <Phone className="size-3.5" />
              <span dir="ltr">{user.phone?.trim() || "شماره ثبت نشده"}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col px-3 py-2">
          <DropdownMenuItem asChild className={MENU_ITEM}>
            <Link href="/profile">
              <User className="text-gold size-4" /> حساب کاربری من
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className={MENU_ITEM}>
            <Link href="/profile#orders">
              <Truck className="text-gold size-4" /> پیگیری سفارشات
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className={MENU_ITEM}>
            <Link href="/profile#wishlist">
              <Heart className="text-rose size-4" /> علاقه‌مندی‌ها
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className={MENU_ITEM}>
            <Link href="/profile#support">
              <Headphones className="text-gold size-4" /> پشتیبانی
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            className={MENU_ITEM}
            onSelect={() => logout()}
          >
            <LogOut className="size-4" /> خروج از حساب
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

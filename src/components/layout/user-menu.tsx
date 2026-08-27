"use client";

import Link from "next/link";
import { ChevronDown, LogIn, LogOut, Phone, Truck, User } from "lucide-react";
import { useStore } from "@/lib/store";
import { fullName, givenName } from "@/lib/format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CLUSTER_H } from "./header-styles";

function Face({ src, letter, className }: { src?: string; letter: string; className?: string }) {
  return (
    <Avatar className={cn("ring-2 ring-gold dark:ring-gold-soft", className)}>
      <AvatarImage src={src} alt="" />
      <AvatarFallback className="bg-navy font-black text-gold-soft dark:bg-dusk-alt">{letter}</AvatarFallback>
    </Avatar>
  );
}

/**
 * جزیرهٔ کاربر: یا دکمهٔ ورود، یا منوی حساب.
 * تنها بخشی از هدر که به استور وابسته است.
 */
export function UserMenu() {
  const { user, setAuthOpen, logout } = useStore();

  if (!user) {
    return (
      <Button
        onClick={() => setAuthOpen(true)}
        className={cn(
          CLUSTER_H,
          "shrink-0 gap-1.5 rounded-full border-2 border-gold bg-gold font-extrabold text-navy-deep hover:bg-gold-light",
          "px-2.5 text-[11px] min-[400px]:px-3 min-[400px]:text-xs md:px-2.5 lg:px-4",
          "focus-visible:ring-2 focus-visible:ring-gold/60",
        )}
      >
        <LogIn className="size-4 shrink-0" />
        <span className="whitespace-nowrap">ورود | ثبت‌نام</span>
      </Button>
    );
  }

  const first = givenName(user.firstName);
  const name = fullName(user.firstName, user.lastName);

  return (
    <DropdownMenu dir="rtl" modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            CLUSTER_H,
            "group shrink-0 gap-1.5 rounded-full px-1 sm:pe-3 md:pe-1 lg:pe-3",
            "border-gold/55 bg-white hover:border-gold hover:bg-white",
            "focus-visible:ring-2 focus-visible:ring-gold/60",
            "dark:border-gold/45 dark:bg-dusk dark:hover:border-gold dark:hover:bg-dusk",
          )}
        >
          <Face src={user.avatar} letter={first.charAt(0)} className="size-7 text-xs sm:size-8" />
          <span className="hidden max-w-20 truncate text-xs font-extrabold text-navy min-[400px]:inline md:hidden lg:inline dark:text-linen">
            {first}
          </span>
          <ChevronDown className="hidden size-3.5 text-gold transition-transform min-[400px]:block md:hidden lg:block group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={12}
        className={cn(
          "z-[80] w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-[22px] border border-gold bg-paper p-0",
          "dark:border-gold/50 dark:bg-dusk",
        )}
      >
        <div className="flex items-center gap-3 border-b border-gold bg-linear-to-br from-navy to-navy-mid px-4 py-3.5 dark:border-gold/40">
          <Face src={user.avatar} letter={first.charAt(0)} className="size-12 text-lg" />
          <div className="min-w-0">
            <p className="m-0 truncate text-[15px] font-black text-white">{name}</p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-bold text-gold-soft">
              <Phone className="size-3.5" />
              <span dir="ltr">{user.phone?.trim() || "شماره ثبت نشده"}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col px-3 py-2">
          <DropdownMenuItem asChild className="rounded-[10px] py-2.5 font-bold">
            <Link href="/profile">
              <User className="size-4 text-gold" /> حساب کاربری من
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-[10px] py-2.5 font-bold">
            <Link href="/profile#orders">
              <Truck className="size-4 text-gold" /> پیگیری سفارشات
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" className="rounded-[10px] py-2.5 font-bold" onSelect={() => logout()}>
            <LogOut className="size-4" /> خروج از حساب
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

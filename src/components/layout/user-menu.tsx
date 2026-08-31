"use client";

import Link from "next/link";
import {
  ChevronDown,
  Heart,
  Headphones,
  LogIn,
  LogOut,
  Phone,
  Truck,
  User,
} from "lucide-react";
import { useStore } from "@/providers/store-provider";
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

function Face({
  src,
  letter,
  className,
}: {
  src?: string;
  letter: string;
  className?: string;
}) {
  return (
    <Avatar className={cn("ring-gold dark:ring-gold-soft ring-2", className)}>
      <AvatarImage src={src} alt="" />
      <AvatarFallback className="bg-navy text-gold-soft dark:bg-dusk-alt font-black">
        {letter}
      </AvatarFallback>
    </Avatar>
  );
}

export function UserMenu() {
  const { user, setAuthOpen, logout } = useStore();

  if (!user) {
    return (
      <Button
        onClick={() => setAuthOpen(true)}
        className={cn(
          CLUSTER_H,
          "border-gold bg-gold text-navy-deep hover:bg-gold-light shrink-0 gap-1.5 rounded-full border-2 font-extrabold",
          "px-2.5 text-[11px] min-[400px]:px-3 min-[400px]:text-xs md:px-2.5 lg:px-4",
          "focus-visible:ring-gold/60 focus-visible:ring-2",
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
            "border-gold/55 hover:border-gold bg-white hover:bg-white",
            "focus-visible:ring-gold/60 focus-visible:ring-2",
            "dark:border-gold/45 dark:bg-dusk dark:hover:border-gold dark:hover:bg-dusk",
          )}
        >
          <Face
            src={user.avatar}
            letter={first.charAt(0)}
            className="size-7 text-xs sm:size-8"
          />
          <span className="text-navy dark:text-linen hidden max-w-20 truncate text-xs font-extrabold min-[480px]:inline md:hidden lg:inline">
            {first}
          </span>
          <ChevronDown className="text-gold hidden size-3.5 transition-transform group-data-open:rotate-180 min-[480px]:block md:hidden lg:block" />
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
        <div className="border-gold from-navy to-navy-mid dark:border-gold/40 flex items-center gap-3 border-b bg-linear-to-br px-4 py-3.5">
          <Face
            src={user.avatar}
            letter={first.charAt(0)}
            className="size-12 text-lg"
          />
          <div className="min-w-0">
            <p className="m-0 truncate text-[15px] font-black text-white">
              {name}
            </p>
            <p className="text-gold-soft mt-1 inline-flex items-center gap-1.5 text-[11px] font-bold">
              <Phone className="size-3.5" />
              <span dir="ltr">{user.phone?.trim() || "شماره ثبت نشده"}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col px-3 py-2">
          <DropdownMenuItem asChild className="rounded-[10px] py-2.5 font-bold">
            <Link href="/profile">
              <User className="text-gold size-4" /> حساب کاربری من
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-[10px] py-2.5 font-bold">
            <Link href="/profile#orders">
              <Truck className="text-gold size-4" /> پیگیری سفارشات
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-[10px] py-2.5 font-bold">
            <Link href="/profile#wishlist">
              <Heart className="text-rose size-4" /> علاقه‌مندی‌ها
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-[10px] py-2.5 font-bold">
            <Link href="/profile#support">
              <Headphones className="text-gold size-4" /> پشتیبانی
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            className="rounded-[10px] py-2.5 font-bold"
            onSelect={() => logout()}
          >
            <LogOut className="size-4" /> خروج از حساب
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

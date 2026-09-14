"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { ArrowUpLeft, Wallet } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useWallet } from "@/hooks/use-wallet";
import { announceProfileTab, profileTabHref } from "@/lib/profile-nav";
import { formatToman } from "@/lib/locale/fa";
import { cn } from "@/lib/utils";

export function WalletLink({
  menu = false,
  className,
  onClick,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & { menu?: boolean }) {
  const { user } = useAuth();
  const { data, loading, error } = useWallet();
  if (!user) return null;
  const balance = data
    ? `${formatToman(data.balance)} تومان`
    : loading
      ? "در حال دریافت…"
      : "موجودی در دسترس نیست";
  return (
    <Link
      {...props}
      href={profileTabHref("wallet")}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) announceProfileTab("wallet");
      }}
      aria-label={`کیف پول من؛ ${balance}`}
      title={error || balance}
      className={cn(
        className,
        "group border-gold/25 text-navy dark:text-ivory focus-visible:ring-gold/60 items-center border outline-none transition-colors focus-visible:ring-2",
        menu
          ? "from-gold/15 to-gold/5 mx-3 mt-3 flex gap-3 rounded-2xl bg-linear-to-l px-3 py-3 hover:bg-gold/15 dark:from-gold/12 dark:to-transparent"
          : "hidden h-9 w-21 shrink-0 gap-1.5 rounded-full bg-gold/8 px-2 min-[480px]:inline-flex md:hidden lg:inline-flex lg:h-10 hover:bg-gold/15",
      )}
    >
      <span
        className={cn(
          "text-gold-deep dark:text-gold shrink-0",
          menu && "bg-gold/15 grid size-9 place-items-center rounded-xl",
        )}
      >
        <Wallet className={menu ? "size-4.5" : "size-4"} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block font-bold", menu ? "text-[11px]" : "text-[9px]")}>
          کیف پول من
        </span>
        {loading && !data ? (
          <span
            aria-hidden
            className="bg-gold/20 mt-1 block h-2 w-10 rounded-full motion-safe:animate-pulse"
          />
        ) : (
          <span
            className={cn(
              "mt-0.5 block truncate font-black",
              menu ? "text-xs" : "text-[9px]",
            )}
            dir="rtl"
          >
            {data ? (menu ? balance : `${formatToman(data.balance)} ت`) : "—"}
          </span>
        )}
      </span>
      {menu ? <ArrowUpLeft className="text-gold-deep dark:text-gold size-4" /> : null}
    </Link>
  );
}

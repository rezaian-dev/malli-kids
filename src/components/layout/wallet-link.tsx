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
  className,
  onClick,
  ...props
}: Omit<ComponentProps<typeof Link>, "href">) {
  const { user } = useAuth();
  const { data, loading, error } = useWallet();
  if (!user) return null;
  // A wallet we could not read still has to read as "empty", never as a dash.
  const balance = formatToman(data?.balance ?? 0) + " تومان";
  const statusLabel = data
    ? balance
    : loading
      ? "در حال دریافت…"
      : `موجودی: ${balance}`;

  return (
    <Link
      {...props}
      href={profileTabHref("wallet")}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) announceProfileTab("wallet");
      }}
      aria-label={`کیف پول من؛ ${statusLabel}`}
      title={error || statusLabel}
      className={cn(
        className,
        "group border-gold/25 text-navy dark:text-ivory focus-visible:ring-gold/60 items-center border outline-none transition-colors focus-visible:ring-2",
        "from-gold/15 to-gold/5 mx-3 mt-3 flex gap-3 rounded-2xl bg-linear-to-l px-3 py-3 hover:bg-gold/15 dark:from-gold/12 dark:to-transparent",
      )}
    >
      <span className="text-gold-deep dark:text-gold bg-gold/15 grid size-9 shrink-0 place-items-center rounded-xl">
        <Wallet className="size-4.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-bold">کیف پول من</span>
        {loading && !data ? (
          <span
            aria-hidden
            className="bg-gold/20 mt-1 block h-2 w-10 rounded-full motion-safe:animate-pulse"
          />
        ) : (
          <span className="mt-0.5 block truncate text-xs font-black" dir="rtl">
            {balance}
          </span>
        )}
      </span>
      <ArrowUpLeft className="text-gold-deep dark:text-gold size-4" />
    </Link>
  );
}

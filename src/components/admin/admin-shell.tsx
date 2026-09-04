"use client";

import "@/lib/zod-config";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";

import { ModeToggle } from "@/components/shared/mode-toggle";
import { SkipLink } from "@/components/shared/skip-link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { signOutAction } from "@/lib/auth/actions";
import type { AdminNotifCounts } from "@/lib/admin/notif-counts";
import { getAdminNotifCountsAction } from "@/lib/admin/notif-counts-actions";
import { ADMIN_NAV } from "@/lib/admin/nav";
import { usePolling } from "@/hooks/use-polling";
import { cn } from "@/lib/utils";
import { AdminAccountFooter } from "./admin-account-footer";
import { AdminHeaderIdentity } from "./admin-header-identity";
import { AdminHeaderNotifications } from "./admin-header-notifications";
import { AdminSidebarNav, routeIsActive } from "./admin-sidebar-nav";
import { AdminSidebarScroller } from "./admin-sidebar-scroller";

export type AdminIdentity = {
  username: string;
  name: string;
  avatar?: string;
};

const SCROLL_EDGE_TOP = cn(
  "pointer-events-none absolute inset-x-0 top-0 z-3 h-4",
  "bg-[linear-gradient(to_bottom,rgba(255,255,255,0.78),transparent)]",
  "dark:bg-[linear-gradient(to_bottom,rgba(3,17,31,0.9),transparent)]",
);

const SCROLL_EDGE_BOTTOM = cn(
  "pointer-events-none absolute inset-x-0 bottom-0 z-3 h-4",
  "bg-[linear-gradient(to_top,rgba(255,255,255,0.78),transparent)]",
  "dark:bg-[linear-gradient(to_top,rgba(3,17,31,0.9),transparent)]",
);

const ORBIT_DOT_A =
  "bg-gold absolute inset-s-[15%] top-[12%] size-1.25 rounded-full shadow-[0_0_16px_rgba(193,147,87,0.55)]";
const ORBIT_DOT_B =
  "bg-gold absolute inset-e-[8%] bottom-1/4 size-0.75 rounded-full shadow-[0_0_16px_rgba(193,147,87,0.55)]";

const BRAND = (
  <div className="flex min-w-0 items-center gap-3">
    <span
      className={cn(
        "relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl ring-1",
        "bg-navy ring-gold/25 shadow-[0_12px_28px_-14px_rgba(4,20,39,.8)]",
        "dark:bg-white/8",
      )}
    >
      <Image
        src="/brand/logo-white.png"
        alt="ملی کیدز"
        width={42}
        height={42}
        className="size-10 object-contain p-1.5"
      />
      <span
        className={cn(
          "absolute inset-x-2 bottom-0 h-px",
          "via-gold bg-linear-to-r from-transparent to-transparent",
        )}
      />
    </span>
    <div className="min-w-0 leading-none">
      <p
        className={cn(
          "font-display text-sm font-bold tracking-[0.2em]",
          "text-navy",
          "dark:text-ivory",
        )}
      >
        MALLI
      </p>
      <p className="text-gold mt-1.5 text-[9px] font-black tracking-[0.29em]">
        ADMIN CONSOLE
      </p>
    </div>
  </div>
);

const FALLBACK_ADMIN_PROFILE: AdminIdentity = {
  username: "admin",
  name: "مدیر گالری",
};

const POLL_MS = 15_000;

export function AdminShell({
  children,
  profile: identity,
  counts: initialCounts,
}: {
  children: ReactNode;
  /** 🔒 The real, server-verified admin (from `requireAdmin()` in
   *  `admin/layout.tsx`) — `null` on `/admin/login` itself, where no admin
   *  session exists yet. Display data only; grants no access by itself —
   *  every protected page re-checks `requireAdmin()` server-side. */
  profile: AdminIdentity | null;
  counts: AdminNotifCounts;
}) {
  const path = usePathname();
  const router = useRouter();

  const [counts] = usePolling(
    getAdminNotifCountsAction,
    POLL_MS,
    initialCounts,
    Boolean(identity),
  );
  const profile = identity ?? FALLBACK_ADMIN_PROFILE;
  const [open, setOpen] = useState(false);
  const current =
    ADMIN_NAV.find((item) => routeIsActive(path, item.href)) ?? ADMIN_NAV[0];

  if (path === "/admin/login") return <>{children}</>;

  function logout() {
    void signOutAction().then(() => router.push("/admin/login"));
  }

  return (
    <div
      className={cn(
        "relative isolate min-h-dvh overflow-x-clip",
        "text-navy bg-fog bg-[radial-gradient(52%_38%_at_100%_0%,rgba(193,147,87,0.15),transparent_68%),radial-gradient(42%_34%_at_0%_100%,rgba(14,42,71,0.08),transparent_72%),linear-gradient(rgba(14,42,71,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(14,42,71,0.022)_1px,transparent_1px)] bg-size-[auto,auto,36px_36px,36px_36px]",
        "dark:text-ivory dark:bg-[#03111f] dark:bg-[radial-gradient(58%_44%_at_103%_-4%,rgba(193,147,87,0.18),transparent_68%),radial-gradient(45%_38%_at_-5%_105%,rgba(44,86,128,0.34),transparent_72%),linear-gradient(rgba(232,197,122,0.027)_1px,transparent_1px),linear-gradient(90deg,rgba(232,197,122,0.027)_1px,transparent_1px)] dark:bg-size-[auto,auto,42px_42px,42px_42px]",
      )}
    >
      <SkipLink />
      {}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed inset-0 z-0 mask-[linear-gradient(to_bottom_left,#000,transparent_64%)] bg-size-[min(44vw,38rem)] bg-position-[calc(100%+45px)_-45px] bg-no-repeat opacity-22",
          "max-[639px]:bg-size-[20rem] max-[639px]:opacity-14",
          "dark:opacity-52 dark:filter-[drop-shadow(0_0_22px_rgba(193,147,87,0.08))]",
        )}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='180' height='180' viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c19357' stroke-opacity='.28'%3E%3Ccircle cx='90' cy='90' r='42'/%3E%3Ccircle cx='90' cy='90' r='28' stroke-dasharray='3 7'/%3E%3Cpath d='M90 34v112M34 90h112M50 50l80 80M130 50l-80 80' stroke-opacity='.15'/%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <span
          className={cn(
            "animate-admin-orbit absolute -inset-e-72 top-[14%] block aspect-square w-[min(46vw,36rem)] rounded-full border motion-reduce:animate-none max-[639px]:w-96",
            "border-gold/13 shadow-[inset_0_0_60px_rgba(193,147,87,0.025)]",
          )}
        >
          <span className={ORBIT_DOT_A} />
          <span className={ORBIT_DOT_B} />
        </span>
        <span
          className={cn(
            "animate-admin-orbit absolute -inset-s-40 -bottom-36 block aspect-square w-[min(32vw,24rem)] rounded-full border direction-[reverse] motion-reduce:animate-none max-[639px]:hidden",
            "border-gold/13 shadow-[inset_0_0_60px_rgba(193,147,87,0.025)]",
          )}
        >
          <span className={ORBIT_DOT_A} />
          <span className={ORBIT_DOT_B} />
        </span>
        <span className="bg-gold/4.5 animate-admin-glow absolute inset-e-[18%] top-[42%] size-96 rounded-full blur-[90px] motion-reduce:animate-none" />
      </div>

      <aside
        className={cn(
          "fixed inset-y-0 inset-s-0 z-40 hidden w-69 flex-col overflow-hidden border-e backdrop-blur-2xl lg:flex",
          "border-navy/8 bg-white/68 shadow-[0_18px_55px_-40px_rgba(4,20,39,0.62)]",
          "dark:border-gold/16 dark:bg-navy-deep/62 dark:shadow-[0_20px_60px_-38px_rgba(0,0,0,0.82)]",
        )}
      >
        <div className="bg-gold/12 dark:bg-gold/9 pointer-events-none absolute inset-s-0 -top-20 size-56 rounded-full blur-3xl" />
        <div className="relative px-5 pt-6 pb-5">{BRAND}</div>
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <span aria-hidden="true" className={SCROLL_EDGE_TOP} />
          <span aria-hidden="true" className={SCROLL_EDGE_BOTTOM} />
          <AdminSidebarScroller className="pb-2">
            <AdminSidebarNav counts={counts} />
          </AdminSidebarScroller>
        </div>
        <div className="relative">
          <AdminAccountFooter onLogout={logout} />
        </div>
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className={cn(
            "w-[min(88vw,19rem)] gap-0 border-s p-0 sm:max-w-76",
            "border-navy/10 bg-fog/98",
            "dark:border-gold/18 dark:bg-navy-deep/98",
          )}
        >
          <SheetHeader className="flex-row items-center justify-between p-4 text-start">
            <SheetTitle asChild>{BRAND}</SheetTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "size-9 rounded-xl",
                "bg-navy/5 text-navy",
                "dark:text-ivory dark:bg-white/8",
              )}
              onClick={() => setOpen(false)}
              aria-label="بستن منو"
            >
              <X className="size-4" />
            </Button>
          </SheetHeader>
          <Separator className="bg-navy/8 dark:bg-gold/14" />
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <span aria-hidden="true" className={SCROLL_EDGE_TOP} />
            <span aria-hidden="true" className={SCROLL_EDGE_BOTTOM} />
            <AdminSidebarScroller className="pt-3 pb-2">
              <AdminSidebarNav onNavigate={() => setOpen(false)} counts={counts} />
            </AdminSidebarScroller>
          </div>
          <AdminAccountFooter
            onLogout={() => {
              setOpen(false);
              logout();
            }}
          />
        </SheetContent>
      </Sheet>

      <div className="relative z-10 min-w-0 lg:ps-69">
        <header
          className={cn(
            "sticky top-0 z-30 border-b backdrop-blur-2xl",
            "border-navy/7 bg-fog/76 shadow-[0_18px_55px_-40px_rgba(4,20,39,0.62)]",
            "dark:border-gold/14 dark:bg-navy-deep/64 dark:shadow-[0_20px_60px_-38px_rgba(0,0,0,0.82)]",
          )}
        >
          {}
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-x-0 -bottom-px h-px opacity-42",
              "bg-[linear-gradient(to_left,transparent,rgba(193,147,87,0.58)_28%,rgba(193,147,87,0.12)_72%,transparent)]",
            )}
          />
          <div className="mx-auto flex h-18 max-w-400 items-center gap-2 px-3 sm:gap-2.5 sm:px-5 lg:px-8">
            <Button
              type="button"
              variant="gold"
              size="icon"
              className={cn(
                "size-10 shrink-0 rounded-xl lg:hidden",
                "shadow-[0_10px_24px_-14px_rgba(193,147,87,.9)]",
              )}
              onClick={() => setOpen(true)}
              aria-label="بازکردن منوی مدیریت"
            >
              <Menu className="size-4" />
            </Button>

            <div className="flex min-w-0 items-center gap-2">
              <span
                className={cn(
                  "hidden size-8 shrink-0 place-items-center rounded-xl sm:grid",
                  "bg-navy/5 text-gold",
                  "dark:bg-white/5",
                )}
              >
                <current.Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p
                  className={cn(
                    "truncate text-[10px] font-black sm:text-[11px]",
                    "text-navy",
                    "dark:text-ivory",
                  )}
                >
                  {current.label}
                </p>
                <p
                  className={cn(
                    "hidden truncate text-[9px] font-bold sm:block",
                    "text-navy/70",
                    "dark:text-wheat/70",
                  )}
                >
                  فضای عملیاتی ملی کیدز
                </p>
              </div>
            </div>

            <div className="ms-auto flex min-w-0 items-center gap-1.5 sm:gap-2">
              <AdminHeaderNotifications counts={counts} />
              <ModeToggle
                className={cn(
                  "size-10 shrink-0 rounded-xl border shadow-sm",
                  "border-navy/9 text-navy bg-white/70",
                  "dark:border-gold/16 dark:text-gold-soft dark:bg-white/4",
                )}
              />
              <AdminHeaderIdentity profile={profile} />
            </div>
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto w-full max-w-400 px-3 py-5 sm:px-5 sm:py-7 lg:px-8 lg:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

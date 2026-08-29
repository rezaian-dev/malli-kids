"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Activity, Bell, ChevronLeft, LayoutGrid, LogOut, Menu, ShieldCheck, ShoppingBag, Sparkles, X } from "lucide-react";

import { ModeToggle } from "@/components/shared/mode-toggle";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAdmin, type AdminIdentity } from "@/features/admin/lib/admin-store";
import { ADMIN_NAV, ADMIN_NAV_GROUPS } from "@/features/admin/lib/nav";
import { toFaDigits } from "@/lib/format";
import { useTickets } from "@/lib/tickets";

const BRAND = (
  <div className="flex min-w-0 items-center gap-3">
    <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-navy shadow-[0_12px_28px_-14px_rgba(4,20,39,.8)] ring-1 ring-gold/25 dark:bg-white/8">
      <Image src="/brand/logo-white.png" alt="مالی کیدز" width={42} height={42} className="size-10 object-contain p-1.5" />
      <span className="absolute inset-x-2 bottom-0 h-px bg-linear-to-r from-transparent via-gold to-transparent" />
    </span>
    <div className="min-w-0 leading-none">
      <p className="font-display text-sm font-bold tracking-[0.2em] text-navy dark:text-ivory">MALLI</p>
      <p className="mt-1.5 text-[9px] font-black tracking-[0.29em] text-gold">ADMIN CONSOLE</p>
    </div>
  </div>
);

const FALLBACK_ADMIN_PROFILE: AdminIdentity = {
  username: "admin",
  name: "مدیر گالری",
};

function routeIsActive(path: string, href: string) {
  return href === "/admin" ? path === "/admin" : path.startsWith(href);
}

/** اسکرول سفارشی سایدبار با نشانگرِ زندهٔ موقعیت؛ مستقل از ظاهر پیش‌فرض مرورگر. */
function SidebarScroller({ children, className = "" }: { children: ReactNode; className?: string }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState({ top: 0, thumb: 100, visible: false });

  const updateScroll = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const max = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
    // Rail از هر سمت ۱.۱rem فاصله دارد؛ اندازهٔ پیکسلی باعث می‌شود Thumb حتی
    // وقتی ارتفاع والد با inset تعیین شده، در همهٔ مرورگرها دقیق حرکت کند.
    const railHeight = Math.max(1, viewport.clientHeight - 35.2);
    const ratio = viewport.clientHeight / Math.max(1, viewport.scrollHeight);
    const thumb = Math.max(44, Math.min(railHeight, railHeight * ratio));
    const progress = max > 0 ? viewport.scrollTop / max : 0;
    const top = progress * Math.max(0, railHeight - thumb);
    setScroll((current) => {
      const next = { top, thumb, visible: max > 2 };
      return Math.abs(current.top - next.top) < 0.5 && Math.abs(current.thumb - next.thumb) < 0.5 && current.visible === next.visible ? current : next;
    });
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(updateScroll);
    const viewport = viewportRef.current;
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateScroll) : null;
    if (viewport) observer?.observe(viewport);
    if (viewport?.firstElementChild) observer?.observe(viewport.firstElementChild);
    window.addEventListener("resize", updateScroll);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", updateScroll);
    };
  }, [updateScroll]);

  return (
    <div className="admin-sidebar-scroller relative h-full min-h-0">
      <div ref={viewportRef} onScroll={updateScroll} className={`admin-sidebar-scroll h-full overflow-y-auto ${className}`}>
        {children}
      </div>
      <span className={`admin-scroll-rail ${scroll.visible ? "is-visible" : ""}`} aria-hidden="true">
        <span
          className="admin-scroll-thumb"
          style={{ "--admin-scroll-top": `${scroll.top}px`, "--admin-scroll-size": `${scroll.thumb}px` } as CSSProperties}
        />
      </span>
    </div>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  const { db } = useAdmin();
  const tickets = useTickets();
  const unanswered = tickets.filter((ticket) => ticket.status === "open").length;
  const freshOrders = db.orders.filter((order) => order.status === "جدید").length;

  return (
    <nav className="flex flex-col gap-2 px-3 pb-4" aria-label="منوی مدیریت">
      {ADMIN_NAV_GROUPS.map((group) => {
        const items = ADMIN_NAV.filter((item) => item.group === group.id);
        return (
          <section key={group.id} aria-labelledby={`admin-nav-${group.id}`}>
            <div className="mb-1 flex items-center gap-2 px-3 pt-2">
              <p id={`admin-nav-${group.id}`} className="text-[9px] font-black text-navy/45 dark:text-wheat/58">{group.label}</p>
              <span className="h-px flex-1 bg-linear-to-l from-navy/10 to-transparent dark:from-gold/14" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              {items.map((item) => {
                const active = routeIsActive(path, item.href);
                const badge = item.href === "/admin/orders" ? freshOrders : item.href === "/admin/messages" ? unanswered : 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`admin-nav-item group relative flex items-center gap-3 overflow-hidden rounded-2xl px-2.5 py-2 transition-all duration-300 ${
                      active
                        ? "bg-navy text-ivory shadow-[0_14px_30px_-18px_rgba(4,20,39,.85)] dark:bg-gold dark:text-navy-deep"
                        : "text-navy/68 hover:bg-navy/5 hover:text-navy dark:text-ivory/68 dark:hover:bg-white/6 dark:hover:text-ivory"
                    }`}
                  >
                    {active ? <span className="absolute inset-y-2 start-0 w-0.5 rounded-full bg-gold dark:bg-navy-deep/45" /> : null}
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${
                        active ? "bg-gold text-navy-deep dark:bg-navy-deep dark:text-gold" : "bg-navy/6 text-navy/55 dark:bg-white/6 dark:text-gold-soft"
                      }`}
                    >
                      <item.Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-black">{item.label}</span>
                      <span className={`block truncate text-[9px] font-bold ${active ? "text-ivory/55 dark:text-navy/55" : "text-navy/36 dark:text-ivory/34"}`}>{item.hint}</span>
                    </span>
                    {badge > 0 ? (
                      <span className="grid min-w-5 shrink-0 place-items-center rounded-lg bg-rose px-1.5 py-1 text-[9px] font-black leading-none text-white shadow-[0_0_0_3px_rgba(225,29,72,.1)]">
                        {toFaDigits(badge)}
                      </span>
                    ) : active ? (
                      <ChevronLeft className="size-3.5 shrink-0 opacity-45" />
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </nav>
  );
}

function AccountFooter({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="border-t border-navy/8 p-3 dark:border-gold/14">
      <button
        type="button"
        onClick={onLogout}
        className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl px-3 text-[11px] font-black text-rose transition hover:bg-rose/9 focus-visible:bg-rose/9"
      >
        <LogOut className="size-4" /> خروج از پنل
      </button>
    </div>
  );
}

// نام سازگار با باندل‌های Fast Refresh قبلی؛ هر دو نام دقیقاً فوتر سادهٔ خروج را رندر می‌کنند.
const SidebarFooter = AccountFooter;

function HeaderNotifications() {
  const { db } = useAdmin();
  const tickets = useTickets();
  const notices = [
    { label: "سفارش جدید", hint: "نیازمند شروع پردازش", count: db.orders.filter((order) => order.status === "جدید").length, href: "/admin/orders", Icon: ShoppingBag },
    { label: "تیکت باز", hint: "در انتظار پاسخ پشتیبانی", count: tickets.filter((ticket) => ticket.status === "open").length, href: "/admin/messages", Icon: Bell },
    { label: "نظر پنهان", hint: "نیازمند بررسی محتوا", count: db.reviews.filter((review) => !review.visible).length, href: "/admin/reviews", Icon: Sparkles },
  ];
  const total = notices.reduce((sum, notice) => sum + notice.count, 0);

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <button type="button" className="relative hidden size-10 shrink-0 place-items-center rounded-xl border border-navy/8 bg-white/60 text-navy/65 transition hover:border-gold/35 hover:text-gold md:grid dark:border-gold/14 dark:bg-white/[0.035] dark:text-wheat/70" aria-label={`${toFaDigits(total)} اعلان مدیریتی`}>
          <Bell className="size-4" />
          {total > 0 ? <span className="absolute -end-1 -top-1 grid min-w-4 place-items-center rounded-full bg-rose px-1 text-[8px] font-black leading-4 text-white shadow-[0_0_0_3px_rgba(225,29,72,.1)]">{toFaDigits(total)}</span> : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="w-[min(20rem,calc(100vw-1.5rem))] rounded-2xl border-navy/9 bg-fog/98 p-2 shadow-[0_24px_70px_-26px_rgba(4,20,39,.72)] dark:border-gold/18 dark:bg-navy-deep/98">
        <DropdownMenuLabel className="flex items-center justify-between px-2.5 py-2">
          <span className="text-xs font-black text-navy dark:text-ivory">مرکز پیگیری</span>
          <span className="rounded-lg bg-rose/9 px-2 py-1 text-[9px] font-black text-rose">{toFaDigits(total)} مورد</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-navy/7 dark:bg-gold/12" />
        {notices.map((notice) => (
          <DropdownMenuItem key={notice.href} asChild className="rounded-xl p-0 focus:bg-gold/8 dark:focus:bg-white/5">
            <Link href={notice.href} className="flex w-full items-center gap-3 px-2.5 py-2.5 outline-none">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-navy/6 text-gold dark:bg-white/6"><notice.Icon className="size-4" /></span>
              <span className="min-w-0 flex-1"><span className="block text-[11px] font-black text-navy dark:text-ivory">{notice.label}</span><span className="mt-0.5 block truncate text-[9px] font-bold text-navy/38 dark:text-wheat/48">{notice.hint}</span></span>
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-navy text-[10px] font-black text-gold dark:bg-gold dark:text-navy-deep">{toFaDigits(notice.count)}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function HeaderIdentity({ profile }: { profile: AdminIdentity }) {
  return (
    <div className="admin-header-identity flex h-10 min-w-0 items-center gap-2 rounded-xl border border-navy/8 bg-white/62 px-3 dark:border-gold/15 dark:bg-white/[0.04]" aria-label={`ادمین واردشده: ${profile.name}`}>
      {profile.avatar ? (
        <Avatar size="sm" className="ring-1 ring-gold/25">
          <AvatarImage src={profile.avatar} alt={`تصویر ${profile.name}`} />
        </Avatar>
      ) : null}
      <span className="max-w-[6.5rem] truncate text-[10px] font-black text-navy sm:max-w-[10rem] sm:text-[11px] dark:text-ivory">{profile.name}</span>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const admin = useAdmin();
  const { logout } = admin;
  // Fast Refresh ممکن است برای یک فریم مقدار Context نسخهٔ قبلی (بدون profile)
  // را نگه دارد؛ fallback از شکستن کل Shell جلوگیری می‌کند.
  const profile = admin.profile ?? FALLBACK_ADMIN_PROFILE;
  const [open, setOpen] = useState(false);
  const current = ADMIN_NAV.find((item) => routeIsActive(path, item.href)) ?? ADMIN_NAV[0];

  if (path === "/admin/login") return <>{children}</>;

  return (
    <div className="admin-root relative isolate min-h-dvh overflow-x-clip">
      <div className="admin-graphic" aria-hidden="true">
        <span className="admin-orbit admin-orbit-one" />
        <span className="admin-orbit admin-orbit-two" />
        <span className="admin-glow" />
      </div>

      <aside className="admin-sidebar fixed inset-y-0 start-0 z-40 hidden w-[276px] flex-col overflow-hidden border-e border-navy/8 bg-white/68 backdrop-blur-2xl dark:border-gold/16 dark:bg-navy-deep/62 lg:flex">
        <div className="pointer-events-none absolute -top-20 start-0 size-56 rounded-full bg-gold/12 blur-3xl dark:bg-gold/9" />
        <div className="relative px-5 pb-5 pt-6">{BRAND}</div>
        <div className="admin-sidebar-nav relative min-h-0 flex-1 overflow-hidden">
          <SidebarScroller className="pb-2">
            <NavList />
          </SidebarScroller>
        </div>
        <div className="relative">
          <SidebarFooter onLogout={logout} />
        </div>
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-[min(88vw,19rem)] gap-0 border-s border-navy/10 bg-fog/98 p-0 sm:max-w-[19rem] dark:border-gold/18 dark:bg-navy-deep/98"
        >
          <SheetHeader className="flex-row items-center justify-between p-4 text-start">
            <SheetTitle asChild>{BRAND}</SheetTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 rounded-xl bg-navy/5 text-navy dark:bg-white/8 dark:text-ivory"
              onClick={() => setOpen(false)}
              aria-label="بستن منو"
            >
              <X className="size-4" />
            </Button>
          </SheetHeader>
          <Separator className="bg-navy/8 dark:bg-gold/14" />
          <div className="admin-sidebar-nav relative min-h-0 flex-1 overflow-hidden">
            <SidebarScroller className="pb-2 pt-3">
              <NavList onNavigate={() => setOpen(false)} />
            </SidebarScroller>
          </div>
          <SidebarFooter
            onLogout={() => {
              setOpen(false);
              logout();
            }}
          />
        </SheetContent>
      </Sheet>

      <div className="relative z-10 min-w-0 lg:ps-[276px]">
        <header className="admin-topbar sticky top-0 z-30 border-b border-navy/7 bg-fog/76 backdrop-blur-2xl dark:border-gold/14 dark:bg-navy-deep/64">
          <div className="mx-auto flex h-[72px] max-w-[100rem] items-center gap-2 px-3 sm:gap-2.5 sm:px-5 lg:px-8">
            <Button
              type="button"
              variant="gold"
              size="icon"
              className="size-10 shrink-0 rounded-xl shadow-[0_10px_24px_-14px_rgba(193,147,87,.9)] lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="بازکردن منوی مدیریت"
            >
              <Menu className="size-4" />
            </Button>

            <div className="flex min-w-0 items-center gap-2">
              <span className="hidden size-8 shrink-0 place-items-center rounded-xl bg-navy/5 text-gold sm:grid dark:bg-white/5">
                <current.Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-black text-navy sm:text-[11px] dark:text-ivory">{current.label}</p>
                <p className="hidden truncate text-[9px] font-bold text-navy/40 dark:text-wheat/55 sm:block">فضای عملیاتی مالی کیدز</p>
              </div>
            </div>

            <div className="ms-auto flex min-w-0 items-center gap-1.5 sm:gap-2">
              <HeaderNotifications />
              <ModeToggle className="size-10 shrink-0 rounded-xl border border-navy/9 bg-white/70 text-navy shadow-sm dark:border-gold/16 dark:bg-white/[0.04] dark:text-gold-soft" />
              <HeaderIdentity profile={profile} />
            </div>
          </div>
        </header>

        <main key={path} className="admin-page mx-auto w-full max-w-[100rem] px-3 py-5 sm:px-5 sm:py-7 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function PageHead({ kicker, title, description, action }: { kicker: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <header className="admin-page-head relative mb-6 overflow-hidden sm:mb-7">
      <span className="admin-page-head-glow" aria-hidden="true" />
      <div className="relative flex flex-col justify-between gap-5 px-4 pb-5 pt-4 sm:flex-row sm:items-end sm:px-6 sm:pb-6 sm:pt-5">
        <div className="min-w-0">
          <div className="mb-3 flex min-w-0 items-center gap-1.5 text-[9px] font-black text-navy/38 dark:text-wheat/50">
            <LayoutGrid className="size-3 text-gold" />
            <span>کنسول مدیریت</span>
            <ChevronLeft className="size-3 opacity-45" />
            <span className="truncate text-navy/58 dark:text-ivory/66">{title}</span>
          </div>
          <div className="relative min-w-0 ps-4">
            <span className="absolute inset-y-1 start-0 w-1 rounded-full bg-linear-to-b from-gold-light via-gold to-gold-deep shadow-[0_0_18px_rgba(193,147,87,.28)]" />
            <p className="text-[9px] font-black tracking-[0.24em] text-gold">{kicker}</p>
            <h1 className="mt-1 font-display text-[clamp(1.6rem,3vw,2.35rem)] font-bold leading-tight tracking-wide text-navy dark:text-ivory">{title}</h1>
            {description ? <p className="mt-2 max-w-2xl text-[11px] font-bold leading-6 text-navy/50 sm:text-xs dark:text-wheat/68">{description}</p> : null}
          </div>
        </div>
        {action ? <div className="flex w-full shrink-0 [&>*]:w-full sm:w-auto sm:[&>*]:w-auto">{action}</div> : null}
      </div>
      <div className="admin-page-head-meta relative flex flex-wrap items-center justify-between gap-2 border-t border-navy/7 px-4 py-2.5 text-[9px] font-bold text-navy/42 sm:px-6 dark:border-gold/12 dark:text-wheat/52">
        <span className="flex items-center gap-1.5"><Activity className="size-3.5 text-emerald-600 dark:text-emerald-300" /><span className="size-1.5 rounded-full bg-emerald-500" /> وضعیت داده‌ها: به‌روز</span>
        <span className="hidden items-center gap-1.5 sm:flex"><ShieldCheck className="size-3.5 text-gold" /> سطح دسترسی: مدیریت</span>
      </div>
    </header>
  );
}

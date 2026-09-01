"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  Activity,
  Bell,
  ChevronLeft,
  LayoutGrid,
  LogOut,
  Menu,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";

import { ModeToggle } from "@/components/shared/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAdmin, type AdminIdentity } from "@/lib/admin/admin-store";
import { ADMIN_NAV, ADMIN_NAV_GROUPS } from "@/lib/admin/nav";
import { toFaDigits } from "@/lib/format";
import { useTickets } from "@/lib/tickets";

const BRAND = (
  <div className="flex min-w-0 items-center gap-3">
    <span className="bg-navy ring-gold/25 relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl shadow-[0_12px_28px_-14px_rgba(4,20,39,.8)] ring-1 dark:bg-white/8">
      <Image
        src="/brand/logo-white.png"
        alt="ملی کیدز"
        width={42}
        height={42}
        className="size-10 object-contain p-1.5"
      />
      <span className="via-gold absolute inset-x-2 bottom-0 h-px bg-linear-to-r from-transparent to-transparent" />
    </span>
    <div className="min-w-0 leading-none">
      <p className="font-display text-navy dark:text-ivory text-sm font-bold tracking-[0.2em]">
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

function routeIsActive(path: string, href: string) {
  return href === "/admin" ? path === "/admin" : path.startsWith(href);
}

function SidebarScroller({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState({ top: 0, thumb: 100, visible: false });

  const updateScroll = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const max = Math.max(0, viewport.scrollHeight - viewport.clientHeight);

    const railHeight = Math.max(1, viewport.clientHeight - 35.2);
    const ratio = viewport.clientHeight / Math.max(1, viewport.scrollHeight);
    const thumb = Math.max(44, Math.min(railHeight, railHeight * ratio));
    const progress = max > 0 ? viewport.scrollTop / max : 0;
    const top = progress * Math.max(0, railHeight - thumb);
    setScroll((current) => {
      const next = { top, thumb, visible: max > 2 };
      return Math.abs(current.top - next.top) < 0.5 &&
        Math.abs(current.thumb - next.thumb) < 0.5 &&
        current.visible === next.visible
        ? current
        : next;
    });
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(updateScroll);
    const viewport = viewportRef.current;
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateScroll)
        : null;
    if (viewport) observer?.observe(viewport);
    if (viewport?.firstElementChild)
      observer?.observe(viewport.firstElementChild);
    window.addEventListener("resize", updateScroll);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", updateScroll);
    };
  }, [updateScroll]);

  return (
    <div className="group relative h-full min-h-0">
      <div
        ref={viewportRef}
        onScroll={updateScroll}
        className={`h-full scrollbar-none overflow-y-auto overscroll-contain pe-2 [&::-webkit-scrollbar]:size-0 ${className}`}
      >
        {children}
      </div>
      <span
        aria-hidden="true"
        className={`bg-navy/[0.07] dark:bg-gold-soft/5.5 pointer-events-none absolute inset-y-[1.1rem] inset-e-0.75 z-5 w-1 rounded-full shadow-[inset_0_0_0_1px_rgba(14,42,71,0.04)] transition-[opacity,transform,width] duration-220 dark:shadow-[inset_0_0_0_1px_rgba(232,197,122,0.06)] ${
          scroll.visible
            ? "scale-y-100 opacity-[0.64] group-hover:w-1.25 group-hover:opacity-100"
            : "scale-y-[0.88] opacity-0"
        }`}
      >
        <span className="bg-gold/55 absolute inset-s-1/2 -top-2 size-1 -translate-x-1/2 rounded-full shadow-[0_0_7px_rgba(193,147,87,0.35)]" />
        <span className="bg-gold/55 absolute inset-s-1/2 -bottom-2 size-1 -translate-x-1/2 rounded-full shadow-[0_0_7px_rgba(193,147,87,0.35)]" />
        <span
          className="from-gold-light to-gold-deep absolute inset-x-0 rounded-full bg-linear-to-b shadow-[0_0_0_1px_rgba(255,248,236,0.24),0_0_14px_rgba(193,147,87,0.38)] transition-[top,height,filter] duration-180 group-hover:brightness-[1.12]"
          style={
            {
              "--admin-scroll-top": `${scroll.top}px`,
              "--admin-scroll-size": `${scroll.thumb}px`,
              top: "var(--admin-scroll-top, 0%)",
              height: "var(--admin-scroll-size, 2.75rem)",
            } as CSSProperties
          }
        />
      </span>
    </div>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  const { db } = useAdmin();
  const tickets = useTickets();
  const unanswered = tickets.filter(
    (ticket) => ticket.status === "open",
  ).length;
  const freshOrders = db.orders.filter(
    (order) => order.status === "جدید",
  ).length;

  return (
    <nav className="flex flex-col gap-2 px-3 pb-4" aria-label="منوی مدیریت">
      {ADMIN_NAV_GROUPS.map((group) => {
        const items = ADMIN_NAV.filter((item) => item.group === group.id);
        return (
          <section key={group.id} aria-labelledby={`admin-nav-${group.id}`}>
            <div className="mb-1 flex items-center gap-2 px-3 pt-2">
              <p
                id={`admin-nav-${group.id}`}
                className="text-navy/45 dark:text-wheat/58 text-[9px] font-black"
              >
                {group.label}
              </p>
              <span
                className="from-navy/10 dark:from-gold/14 h-px flex-1 bg-linear-to-l to-transparent"
                aria-hidden="true"
              />
            </div>
            <div className="space-y-1">
              {items.map((item) => {
                const active = routeIsActive(path, item.href);
                const badge =
                  item.href === "/admin/orders"
                    ? freshOrders
                    : item.href === "/admin/messages"
                      ? unanswered
                      : 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl px-2.5 py-2 transition-all duration-300 ${
                      active
                        ? "bg-navy text-ivory dark:bg-gold dark:text-navy-deep shadow-[0_14px_30px_-18px_rgba(4,20,39,.85)]"
                        : "text-navy/68 hover:bg-navy/5 hover:text-navy dark:text-ivory/68 dark:hover:text-ivory dark:hover:bg-white/6"
                    }`}
                  >
                    {}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 translate-x-[105%] bg-[linear-gradient(105deg,transparent_30%,rgba(255,255,255,.1),transparent_70%)] transition-transform duration-520 ease-[cubic-bezier(.25,.1,.25,1)] group-hover:translate-x-[-105%] motion-reduce:hidden"
                    />
                    {active ? (
                      <span className="bg-gold dark:bg-navy-deep/45 absolute inset-y-2 inset-s-0 w-0.5 rounded-full" />
                    ) : null}
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${
                        active
                          ? "bg-gold text-navy-deep dark:bg-navy-deep dark:text-gold"
                          : "bg-navy/6 text-navy/55 dark:text-gold-soft dark:bg-white/6"
                      }`}
                    >
                      <item.Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-black">
                        {item.label}
                      </span>
                      <span
                        className={`block truncate text-[9px] font-bold ${active ? "text-ivory/55 dark:text-navy/55" : "text-navy/36 dark:text-ivory/34"}`}
                      >
                        {item.hint}
                      </span>
                    </span>
                    <span className="grid size-7 shrink-0 place-items-center">
                      {badge > 0 ? (
                        <span className="bg-rose grid min-w-5 place-items-center rounded-lg px-1.5 py-1 text-[9px] leading-none font-black text-white shadow-[0_0_0_3px_rgba(225,29,72,.1)]">
                          {toFaDigits(badge)}
                        </span>
                      ) : active ? (
                        <ChevronLeft className="size-3.5 opacity-45" />
                      ) : (
                        <span className="size-3.5" aria-hidden />
                      )}
                    </span>
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
    <div className="border-navy/8 dark:border-gold/14 border-t p-3">
      <button
        type="button"
        onClick={onLogout}
        className="text-rose hover:bg-rose/9 focus-visible:bg-rose/9 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl px-3 text-[11px] font-black transition"
      >
        <LogOut className="size-4" /> خروج از پنل
      </button>
    </div>
  );
}

const SidebarFooter = AccountFooter;

function HeaderNotifications() {
  const { db } = useAdmin();
  const tickets = useTickets();
  const notices = [
    {
      label: "سفارش جدید",
      hint: "نیازمند شروع پردازش",
      count: db.orders.filter((order) => order.status === "جدید").length,
      href: "/admin/orders",
      Icon: ShoppingBag,
    },
    {
      label: "تیکت باز",
      hint: "در انتظار پاسخ پشتیبانی",
      count: tickets.filter((ticket) => ticket.status === "open").length,
      href: "/admin/messages",
      Icon: Bell,
    },
    {
      label: "نظر پنهان",
      hint: "نیازمند بررسی محتوا",
      count: db.reviews.filter((review) => !review.visible).length,
      href: "/admin/reviews",
      Icon: Sparkles,
    },
  ];
  const total = notices.reduce((sum, notice) => sum + notice.count, 0);

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="border-navy/8 text-navy/65 hover:border-gold/35 hover:text-gold dark:border-gold/14 dark:text-wheat/70 relative hidden size-10 shrink-0 place-items-center rounded-xl border bg-white/60 transition md:grid dark:bg-white/[0.035]"
          aria-label={`${toFaDigits(total)} اعلان مدیریتی`}
        >
          <Bell className="size-4" />
          {total > 0 ? (
            <span className="bg-rose absolute -inset-e-1 -top-1 grid min-w-4 place-items-center rounded-full px-1 text-[8px] leading-4 font-black text-white shadow-[0_0_0_3px_rgba(225,29,72,.1)]">
              {toFaDigits(total)}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="border-navy/9 bg-fog/98 dark:border-gold/18 dark:bg-navy-deep/98 w-[min(20rem,calc(100vw-1.5rem))] rounded-2xl p-2 shadow-[0_24px_70px_-26px_rgba(4,20,39,.72)]"
      >
        <DropdownMenuLabel className="flex items-center justify-between px-2.5 py-2">
          <span className="text-navy dark:text-ivory text-xs font-black">
            مرکز پیگیری
          </span>
          <span className="bg-rose/9 text-rose rounded-lg px-2 py-1 text-[9px] font-black">
            {toFaDigits(total)} مورد
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-navy/7 dark:bg-gold/12" />
        {notices.map((notice) => (
          <DropdownMenuItem
            key={notice.href}
            asChild
            className="focus:bg-gold/8 rounded-xl p-0 dark:focus:bg-white/5"
          >
            <Link
              href={notice.href}
              className="flex w-full items-center gap-3 px-2.5 py-2.5 outline-none"
            >
              <span className="bg-navy/6 text-gold grid size-9 shrink-0 place-items-center rounded-xl dark:bg-white/6">
                <notice.Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-navy dark:text-ivory block text-[11px] font-black">
                  {notice.label}
                </span>
                <span className="text-navy/38 dark:text-wheat/48 mt-0.5 block truncate text-[9px] font-bold">
                  {notice.hint}
                </span>
              </span>
              <span className="bg-navy text-gold dark:bg-gold dark:text-navy-deep grid size-7 shrink-0 place-items-center rounded-lg text-[10px] font-black">
                {toFaDigits(notice.count)}
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function HeaderIdentity({ profile }: { profile: AdminIdentity }) {
  const letter = profile.name.trim().charAt(0) || "م";
  return (
    <div
      className="border-navy/8 dark:border-gold/15 flex h-10 min-w-0 items-center gap-2 rounded-xl border bg-white/62 px-2.5 shadow-[0_10px_24px_-22px_rgba(14,42,71,0.55)] sm:px-3 dark:bg-white/4 dark:shadow-[0_12px_28px_-22px_rgba(0,0,0,0.85)]"
      aria-label={`ادمین واردشده: ${profile.name}`}
    >
      <Avatar size="sm" className="ring-gold/25 shrink-0 ring-1">
        {profile.avatar ? (
          <AvatarImage src={profile.avatar} alt={`تصویر ${profile.name}`} />
        ) : null}
        <AvatarFallback className="bg-navy text-gold-soft text-[10px] font-black">
          {letter}
        </AvatarFallback>
      </Avatar>
      <span className="text-navy dark:text-ivory max-w-22 truncate text-[10px] font-black sm:max-w-40 sm:text-[11px]">
        {profile.name}
      </span>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const admin = useAdmin();
  const { logout } = admin;

  const profile = admin.profile ?? FALLBACK_ADMIN_PROFILE;
  const [open, setOpen] = useState(false);
  const current =
    ADMIN_NAV.find((item) => routeIsActive(path, item.href)) ?? ADMIN_NAV[0];

  if (path === "/admin/login") return <>{children}</>;

  return (
    <div className="text-navy bg-fog dark:text-ivory relative isolate min-h-dvh overflow-x-clip bg-[radial-gradient(52%_38%_at_100%_0%,rgba(193,147,87,0.15),transparent_68%),radial-gradient(42%_34%_at_0%_100%,rgba(14,42,71,0.08),transparent_72%),linear-gradient(rgba(14,42,71,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(14,42,71,0.022)_1px,transparent_1px)] bg-size-[auto,auto,36px_36px,36px_36px] dark:bg-[#03111f] dark:bg-[radial-gradient(58%_44%_at_103%_-4%,rgba(193,147,87,0.18),transparent_68%),radial-gradient(45%_38%_at_-5%_105%,rgba(44,86,128,0.34),transparent_72%),linear-gradient(rgba(232,197,122,0.027)_1px,transparent_1px),linear-gradient(90deg,rgba(232,197,122,0.027)_1px,transparent_1px)] dark:bg-size-[auto,auto,42px_42px,42px_42px]">
      {}
      <span
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 mask-[linear-gradient(to_bottom_left,#000,transparent_64%)] bg-size-[min(44vw,38rem)] bg-position-[calc(100%+45px)_-45px] bg-no-repeat opacity-[0.22] max-[639px]:bg-size-[20rem] max-[639px]:opacity-[0.14] dark:opacity-[0.52] dark:filter-[drop-shadow(0_0_22px_rgba(193,147,87,0.08))]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='180' height='180' viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c19357' stroke-opacity='.28'%3E%3Ccircle cx='90' cy='90' r='42'/%3E%3Ccircle cx='90' cy='90' r='28' stroke-dasharray='3 7'/%3E%3Cpath d='M90 34v112M34 90h112M50 50l80 80M130 50l-80 80' stroke-opacity='.15'/%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <span className="border-gold/13 animate-admin-orbit absolute -inset-e-72 top-[14%] block aspect-square w-[min(46vw,36rem)] rounded-full border shadow-[inset_0_0_60px_rgba(193,147,87,0.025)] motion-reduce:animate-none max-[639px]:w-96">
          <span className="bg-gold absolute inset-s-[15%] top-[12%] size-1.25 rounded-full shadow-[0_0_16px_rgba(193,147,87,0.55)]" />
          <span className="bg-gold absolute inset-e-[8%] bottom-[25%] size-0.75 rounded-full shadow-[0_0_16px_rgba(193,147,87,0.55)]" />
        </span>
        <span className="border-gold/13 animate-admin-orbit absolute -inset-s-40 -bottom-36 block aspect-square w-[min(32vw,24rem)] rounded-full border shadow-[inset_0_0_60px_rgba(193,147,87,0.025)] [animation-direction:reverse] motion-reduce:animate-none max-[639px]:hidden">
          <span className="bg-gold absolute inset-s-[15%] top-[12%] size-1.25 rounded-full shadow-[0_0_16px_rgba(193,147,87,0.55)]" />
          <span className="bg-gold absolute inset-e-[8%] bottom-[25%] size-0.75 rounded-full shadow-[0_0_16px_rgba(193,147,87,0.55)]" />
        </span>
        <span className="bg-gold/4.5 animate-admin-glow absolute inset-e-[18%] top-[42%] size-96 rounded-full blur-[90px] motion-reduce:animate-none" />
      </div>

      <aside className="border-navy/8 dark:border-gold/16 dark:bg-navy-deep/62 fixed inset-y-0 inset-s-0 z-40 hidden w-69 flex-col overflow-hidden border-e bg-white/68 shadow-[0_18px_55px_-40px_rgba(4,20,39,0.62)] backdrop-blur-2xl lg:flex dark:shadow-[0_20px_60px_-38px_rgba(0,0,0,0.82)]">
        <div className="bg-gold/12 dark:bg-gold/9 pointer-events-none absolute inset-s-0 -top-20 size-56 rounded-full blur-3xl" />
        <div className="relative px-5 pt-6 pb-5">{BRAND}</div>
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-3 h-4 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.78),transparent)] dark:bg-[linear-gradient(to_bottom,rgba(3,17,31,0.9),transparent)]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-3 h-4 bg-[linear-gradient(to_top,rgba(255,255,255,0.78),transparent)] dark:bg-[linear-gradient(to_top,rgba(3,17,31,0.9),transparent)]"
          />
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
          className="border-navy/10 bg-fog/98 dark:border-gold/18 dark:bg-navy-deep/98 w-[min(88vw,19rem)] gap-0 border-s p-0 sm:max-w-76"
        >
          <SheetHeader className="flex-row items-center justify-between p-4 text-start">
            <SheetTitle asChild>{BRAND}</SheetTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="bg-navy/5 text-navy dark:text-ivory size-9 rounded-xl dark:bg-white/8"
              onClick={() => setOpen(false)}
              aria-label="بستن منو"
            >
              <X className="size-4" />
            </Button>
          </SheetHeader>
          <Separator className="bg-navy/8 dark:bg-gold/14" />
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 z-3 h-4 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.78),transparent)] dark:bg-[linear-gradient(to_bottom,rgba(3,17,31,0.9),transparent)]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 z-3 h-4 bg-[linear-gradient(to_top,rgba(255,255,255,0.78),transparent)] dark:bg-[linear-gradient(to_top,rgba(3,17,31,0.9),transparent)]"
            />
            <SidebarScroller className="pt-3 pb-2">
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

      <div className="relative z-10 min-w-0 lg:ps-69">
        <header className="border-navy/7 bg-fog/76 dark:border-gold/14 dark:bg-navy-deep/64 relative sticky top-0 z-30 border-b shadow-[0_18px_55px_-40px_rgba(4,20,39,0.62)] backdrop-blur-2xl dark:shadow-[0_20px_60px_-38px_rgba(0,0,0,0.82)]">
          {}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-[linear-gradient(to_left,transparent,rgba(193,147,87,0.58)_28%,rgba(193,147,87,0.12)_72%,transparent)] opacity-42"
          />
          <div className="mx-auto flex h-18 max-w-[100rem] items-center gap-2 px-3 sm:gap-2.5 sm:px-5 lg:px-8">
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
              <span className="bg-navy/5 text-gold hidden size-8 shrink-0 place-items-center rounded-xl sm:grid dark:bg-white/5">
                <current.Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-navy dark:text-ivory truncate text-[10px] font-black sm:text-[11px]">
                  {current.label}
                </p>
                <p className="text-navy/40 dark:text-wheat/55 hidden truncate text-[9px] font-bold sm:block">
                  فضای عملیاتی ملی کیدز
                </p>
              </div>
            </div>

            <div className="ms-auto flex min-w-0 items-center gap-1.5 sm:gap-2">
              <HeaderNotifications />
              <ModeToggle className="border-navy/9 text-navy dark:border-gold/16 dark:text-gold-soft size-10 shrink-0 rounded-xl border bg-white/70 shadow-sm dark:bg-white/4" />
              <HeaderIdentity profile={profile} />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[100rem] px-3 py-5 sm:px-5 sm:py-7 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AdminPageHeader({
  kicker,
  title,
  description,
  action,
}: {
  kicker: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="admin-page-head border-navy/9 dark:border-gold-soft/17 relative mb-6 overflow-hidden rounded-[26px] border bg-[linear-gradient(115deg,rgba(193,147,87,0.075),transparent_38%),rgba(255,254,251,0.78)] shadow-[0_24px_58px_-42px_rgba(14,42,71,0.5),inset_0_1px_0_rgba(255,255,255,0.84)] backdrop-blur-[20px] sm:mb-7 dark:bg-[linear-gradient(115deg,rgba(193,147,87,0.09),transparent_42%),rgba(10,31,53,0.72)] dark:shadow-[0_28px_70px_-44px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,255,255,0.045),0_0_40px_rgba(193,147,87,0.025)]">
      <span
        className="bg-gold/13 dark:bg-gold/10.5 pointer-events-none absolute -inset-e-16 -top-36 size-60 rounded-full blur-[44px]"
        aria-hidden="true"
      />
      <div className="relative flex flex-col justify-between gap-5 px-4 pt-4 pb-5 sm:flex-row sm:items-end sm:px-6 sm:pt-5 sm:pb-6">
        <div className="min-w-0">
          <div className="text-navy/38 dark:text-wheat/50 mb-3 flex min-w-0 items-center gap-1.5 text-[9px] font-black">
            <LayoutGrid className="text-gold size-3" />
            <span>کنسول مدیریت</span>
            <ChevronLeft className="size-3 opacity-45" />
            <span className="text-navy/58 dark:text-ivory/66 truncate">
              {title}
            </span>
          </div>
          <div className="relative min-w-0 ps-4">
            <span className="from-gold-light via-gold to-gold-deep absolute inset-y-1 inset-s-0 w-1 rounded-full bg-linear-to-b shadow-[0_0_18px_rgba(193,147,87,.28)]" />
            <p className="text-gold text-[9px] font-black tracking-[0.24em]">
              {kicker}
            </p>
            {}
            <h1 className="text-navy dark:text-ivory mt-1 text-[clamp(1.6rem,3vw,2.35rem)] leading-tight font-black">
              {title}
            </h1>
            {description ? (
              <p className="text-navy/50 dark:text-wheat/68 mt-2 max-w-2xl text-[11px] leading-6 font-bold sm:text-xs">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {action ? (
          <div className="flex w-full shrink-0 *:w-full sm:w-auto sm:*:w-auto">
            {action}
          </div>
        ) : null}
      </div>
      <div className="border-navy/7 bg-navy/[0.018] text-navy/42 dark:border-gold/12 dark:text-wheat/52 relative flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2.5 text-[9px] font-bold sm:px-6 dark:bg-white/[0.018]">
        <span className="flex items-center gap-1.5">
          <Activity className="size-3.5 text-emerald-600 dark:text-emerald-300" />
          <span className="size-1.5 rounded-full bg-emerald-500" /> وضعیت
          داده‌ها: به‌روز
        </span>
        <span className="hidden items-center gap-1.5 sm:flex">
          <ShieldCheck className="text-gold size-3.5" /> سطح دسترسی: مدیریت
        </span>
      </div>
    </header>
  );
}

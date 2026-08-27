"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { LogOut, Menu, Shirt, X } from "lucide-react";
import { useAdmin } from "@/features/admin/lib/admin-store";
import { ADMIN_NAV } from "@/features/admin/lib/nav";
import { toFaDigits } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/shared/mode-toggle";

const BRAND = (
  <div className="flex items-center gap-3">
    <img src="/brand/logo-white.png" alt="" className="size-11 shrink-0 rounded-2xl bg-navy p-1.5 object-contain dark:bg-white/10" />
    <div className="leading-none">
      <p className="font-display text-sm font-bold tracking-[0.2em] text-navy dark:text-ivory">MALLI</p>
      <p className="mt-1.5 text-[10px] font-black tracking-[0.32em] text-gold">CONSOLE</p>
    </div>
  </div>
);

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  const { db } = useAdmin();
  const unread = db.messages.filter((m) => !m.read).length;
  const fresh = db.orders.filter((o) => o.status === "جدید").length;

  return (
    <nav className="flex flex-col gap-1 p-3">
      {ADMIN_NAV.map((n) => {
        const on = n.href === "/admin" ? path === "/admin" : path.startsWith(n.href);
        const badge = n.href === "/admin/orders" ? fresh : n.href === "/admin/messages" ? unread : 0;
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={onNavigate}
            className={`relative flex items-center gap-3 overflow-hidden rounded-2xl px-3 py-2.5 transition ${
              on
                ? "bg-navy text-ivory shadow-[0_12px_26px_-14px_rgba(14,42,71,.7)] dark:bg-gold dark:text-navy-deep"
                : "text-navy/70 hover:bg-navy/5 hover:text-navy dark:text-ivory/70 dark:hover:bg-white/6 dark:hover:text-ivory"
            }`}
          >
            {on ? <span className="absolute inset-y-2 start-0 w-1 rounded-full bg-gold dark:bg-navy-deep/40" /> : null}
            <span
              className={`grid size-9 shrink-0 place-items-center rounded-xl ${
                on ? "bg-gold text-navy-deep dark:bg-navy-deep dark:text-gold" : "bg-navy/6 text-navy/60 dark:bg-white/6 dark:text-gold-soft"
              }`}
            >
              <n.Icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-black">{n.label}</span>
              <span className={`block text-[10px] font-bold ${on ? "text-ivory/60 dark:text-navy/55" : "text-navy/40 dark:text-ivory/35"}`}>{n.hint}</span>
            </span>
            {badge ? (
              <span className="ms-auto grid size-5 place-items-center rounded-full bg-rose text-[10px] font-black text-white">{toFaDigits(badge)}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { logout, db } = useAdmin();
  const [open, setOpen] = useState(false);

  if (path === "/admin/login") return <>{children}</>;

  return (
    <div className="admin-root">
      {/* Desktop sidebar — fixed & full height; never scrolls with the page */}
      <aside className="fixed inset-y-0 start-0 z-40 hidden w-[272px] flex-col overflow-hidden border-e border-navy/8 bg-white/70 backdrop-blur-xl dark:border-gold/20 dark:bg-navy-mid/35 lg:flex">
        <div className="pointer-events-none absolute -top-16 start-0 size-48 rounded-full bg-gold/15 blur-3xl" />
        <div className="relative px-5 py-6">{BRAND}</div>
        <div className="relative min-h-0 flex-1 overflow-y-auto">
          <NavList />
        </div>
        <div className="relative border-t border-navy/8 p-4 dark:border-gold/15">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-2xl bg-navy/5 px-3 py-2.5 text-xs font-black text-navy hover:bg-gold hover:text-navy-deep dark:bg-white/5 dark:text-gold-soft dark:hover:bg-gold dark:hover:text-navy-deep"
          >
            <Shirt className="size-4" /> ویترین فروشگاه
          </Link>
          <button
            type="button"
            onClick={logout}
            className="mt-2 flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-black text-rose hover:bg-rose/10"
          >
            <LogOut className="size-4" /> خروج از کنسول
          </button>
        </div>
      </aside>

      {/* Mobile nav — Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" showCloseButton={false} className="w-[min(86vw,300px)] gap-0 border-s border-navy/10 bg-fog p-0 sm:max-w-[300px] dark:border-gold/20 dark:bg-navy-deep">
          <SheetHeader className="flex-row items-center justify-between p-4">
            <SheetTitle asChild>{BRAND}</SheetTitle>
            <Button type="button" variant="ghost" size="icon" className="size-9 rounded-full bg-navy/5 text-navy dark:bg-white/10 dark:text-ivory" onClick={() => setOpen(false)} aria-label="بستن">
              <X className="size-4" />
            </Button>
          </SheetHeader>
          <Separator className="bg-navy/8 dark:bg-gold/15" />
          <div className="flex-1 overflow-y-auto">
            <NavList onNavigate={() => setOpen(false)} />
          </div>
          <div className="border-t border-navy/8 p-4 dark:border-gold/15">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-2xl bg-navy/5 px-3 py-2.5 text-xs font-black text-navy hover:bg-gold hover:text-navy-deep dark:bg-white/5 dark:text-gold-soft dark:hover:bg-gold dark:hover:text-navy-deep"
            >
              <Shirt className="size-4" /> ویترین فروشگاه
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="mt-2 flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-black text-rose hover:bg-rose/10"
            >
              <LogOut className="size-4" /> خروج از کنسول
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="min-w-0 overflow-x-clip lg:ps-[272px]">
        {/* Top bar */}
        <header className="sticky top-0 z-40 border-b border-navy/8 bg-fog/80 backdrop-blur-xl dark:border-gold/20 dark:bg-navy-mid/30">
          <div className="flex items-center gap-2 px-3 py-3 sm:px-5">
            <Button type="button" variant="gold" size="icon" className="size-10 lg:hidden" onClick={() => setOpen(true)} aria-label="منو">
              <Menu className="size-4" />
            </Button>

            <div className="ms-auto flex min-w-0 items-center gap-2">
              <ModeToggle className="size-10 rounded-full border border-navy/10 bg-white text-navy dark:border-gold/25 dark:bg-navy-mid dark:text-gold-soft" />

              <div className="flex min-w-0 items-center gap-2 rounded-full border border-navy/10 bg-white py-1 ps-1 pe-1 text-navy dark:border-gold/25 dark:bg-navy-mid dark:text-ivory sm:pe-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-navy text-[12px] font-black text-gold dark:bg-gold dark:text-navy-deep">مگ</span>
                <span className="hidden truncate text-[12px] font-black sm:block">مدیر گالری</span>
              </div>
            </div>
          </div>
        </header>

        <div className="px-3 py-5 sm:px-5 lg:px-8 lg:py-8">{children}</div>
      </div>
    </div>
  );
}

export function PageHead({ kicker, title, action }: { kicker: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-3 sm:mb-9 sm:flex-row sm:items-end">
      <div>
        <p className="text-[11px] font-black tracking-[0.24em] text-gold">{kicker}</p>
        <h1 className="mt-1 font-display text-[clamp(1.6rem,3vw,2.3rem)] font-bold tracking-wide text-navy dark:text-ivory">{title}</h1>
      </div>
      {action}
    </div>
  );
}

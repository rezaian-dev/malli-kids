"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useAdmin } from "@/lib/admin/admin-store";
import { ADMIN_NAV, ADMIN_NAV_GROUPS } from "@/lib/admin/nav";
import { toFaDigits } from "@/lib/format";
import { useTickets } from "@/lib/tickets";
import { cn } from "@/lib/utils";

export function routeIsActive(path: string, href: string) {
  return href === "/admin" ? path === "/admin" : path.startsWith(href);
}

/** 🧭 The grouped admin nav list, shared by the desktop sidebar and the
 *  mobile drawer. */
export function AdminSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
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
                className={cn(
                  "h-px flex-1",
                  "from-navy/10 bg-linear-to-l to-transparent",
                  "dark:from-gold/14",
                )}
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
                    className={cn(
                      "group relative flex items-center gap-3 overflow-hidden rounded-2xl px-2.5 py-2 transition-all duration-300",
                      active
                        ? "bg-navy text-ivory dark:bg-gold dark:text-navy-deep shadow-[0_14px_30px_-18px_rgba(4,20,39,.85)]"
                        : "text-navy/68 hover:bg-navy/5 hover:text-navy dark:text-ivory/68 dark:hover:text-ivory dark:hover:bg-white/6",
                    )}
                  >
                    {}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none absolute inset-0 translate-x-[105%] transition-transform duration-520 ease-[cubic-bezier(.25,.1,.25,1)] group-hover:translate-x-[-105%] motion-reduce:hidden",
                        "bg-[linear-gradient(105deg,transparent_30%,rgba(255,255,255,.1),transparent_70%)]",
                      )}
                    />
                    {active ? (
                      <span
                        className={cn(
                          "absolute inset-y-2 inset-s-0 w-0.5 rounded-full",
                          "bg-gold",
                          "dark:bg-navy-deep/45",
                        )}
                      />
                    ) : null}
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-105",
                        active
                          ? "bg-gold text-navy-deep dark:bg-navy-deep dark:text-gold"
                          : "bg-navy/6 text-navy/55 dark:text-gold-soft dark:bg-white/6",
                      )}
                    >
                      <item.Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-black">
                        {item.label}
                      </span>
                      <span
                        className={cn(
                          "block truncate text-[9px] font-bold",
                          active
                            ? "text-ivory/55 dark:text-navy/55"
                            : "text-navy/36 dark:text-ivory/34",
                        )}
                      >
                        {item.hint}
                      </span>
                    </span>
                    <span className="grid size-7 shrink-0 place-items-center">
                      {badge > 0 ? (
                        <span
                          className={cn(
                            "grid min-w-5 place-items-center rounded-lg px-1.5 py-1 text-[9px] leading-none font-black",
                            "bg-rose text-white shadow-[0_0_0_3px_rgba(225,29,72,.1)]",
                          )}
                        >
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

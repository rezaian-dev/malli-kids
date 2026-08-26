import Link from "next/link";
import { Fragment } from "react";
import { cn } from "@/lib/utils";

/* 🧭 Chic shared breadcrumb — a frosted-glass gold pill with a home
 * medallion, chevron separators and a highlighted current page. Pure
 * Server Component (CSS-only hover/focus), RTL-native.
 *
 * Usage: <Breadcrumb items={[{ name: "خانه", path: "/" }, { name: "پرو مجازی" }]} />
 * The last item (no `path`) renders as the current page.
 */

export type CrumbItem = { name: string; path?: string };

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-3.5"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-gold/70 size-3 shrink-0"
    >
      {/* points left = “forward” in RTL */}
      <path d="m14.5 6-6 6 6 6" />
    </svg>
  );
}

export function Breadcrumb({ items }: { items: CrumbItem[] }) {
  return (
    <nav aria-label="مسیر صفحه" className="mb-5">
      <ol
        className={cn(
          "inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border px-2 py-1.5",
          "border-gold/30 bg-white/80 shadow-[0_10px_25px_-15px_rgba(14,42,71,.35)] backdrop-blur",
          "dark:border-gold/35 dark:bg-navy-deep/70",
        )}
      >
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={item.name}>
              {i > 0 ? (
                <li aria-hidden="true" className="flex">
                  <Chevron />
                </li>
              ) : null}
              <li className="flex min-w-0">
                {last || !item.path ? (
                  <span
                    aria-current="page"
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black whitespace-nowrap",
                      "bg-gold/15 text-gold-ink dark:bg-gold/20 dark:text-gold-soft",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="bg-gold size-1.5 shrink-0 rounded-full"
                    />
                    <span className="truncate">{item.name}</span>
                  </span>
                ) : (
                  <Link
                    href={item.path}
                    className={cn(
                      "group flex items-center gap-1.5 rounded-full py-1 ps-1 pe-3 text-xs font-bold whitespace-nowrap",
                      "text-navy/70 hover:bg-gold/10 hover:text-gold-ink transition-colors",
                      "dark:text-wheat/80 dark:hover:text-gold-soft",
                      "focus-visible:ring-gold focus-visible:ring-2 focus-visible:outline-none",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full",
                        "bg-gold/15 text-gold-ink group-hover:bg-gold group-hover:text-navy-deep transition-colors",
                        "dark:bg-gold/20 dark:text-gold-soft dark:group-hover:bg-gold dark:group-hover:text-navy-deep",
                      )}
                    >
                      {i === 0 ? (
                        <HomeIcon />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="size-1.5 rounded-full bg-current"
                        />
                      )}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

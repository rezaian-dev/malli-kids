import Link from "next/link";
import { Fragment } from "react";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { cn } from "@/lib/utils";

// Disable schema output if the server already emitted it.

export type CrumbItem = { name: string; path?: string };

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
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

function Diamond() {
  return (
    <span
      aria-hidden="true"
      className="from-gold-soft to-gold-deep mx-1 block size-1.5 rotate-45 rounded-xs bg-linear-to-br transition-transform duration-500 group-hover:rotate-225"
    />
  );
}

export function Breadcrumb({
  items,
  schema = true,
  className,
}: {
  items: CrumbItem[];
  schema?: boolean;
  className?: string;
}) {
  const emittable =
    schema && items.length > 0 && items.every((item) => item.path);
  return (
    <>
      {emittable ? (
        <JsonLd
          data={breadcrumbSchema(items as { name: string; path: string }[])}
        />
      ) : null}
      <nav aria-label="مسیر صفحه" className={cn("mb-5", className)}>
        {/* gradient hairline frame */}
        <div className="from-gold/60 via-gold/20 to-gold/60 inline-block max-w-full rounded-full bg-linear-to-l p-px shadow-[0_12px_28px_-16px_rgba(14,42,71,.4)]">
          <ol className="group dark:bg-navy-deep/85 flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full bg-white/85 px-1.5 py-1 backdrop-blur">
            {items.map((item, i) => {
              const last = i === items.length - 1;
              const linked = !last && item.path;
              return (
                <Fragment key={`${item.name}-${i}`}>
                  {i > 0 ? (
                    <li aria-hidden="true" className="flex shrink-0">
                      <Diamond />
                    </li>
                  ) : null}
                  <li
                    className="animate-crumb-in flex min-w-0"
                    style={{ animationDelay: `${i * 90}ms` }}
                  >
                    {last ? (
                      <span
                        aria-current="page"
                        className="from-gold-soft via-gold to-gold-deep text-navy-deep flex items-center gap-1.5 rounded-full bg-linear-to-l px-3 py-1 text-xs font-black whitespace-nowrap shadow-[0_4px_12px_-4px_rgba(193,147,87,.8)]"
                      >
                        <span
                          aria-hidden="true"
                          className="bg-navy-deep/70 size-1.5 shrink-0 rounded-full"
                        />
                        <span className="truncate">{item.name}</span>
                      </span>
                    ) : linked ? (
                      <Link
                        href={item.path as string}
                        prefetch={false}
                        className="text-navy/70 hover:text-gold-ink dark:text-wheat/80 dark:hover:text-gold-soft focus-visible:ring-gold flex items-center gap-1.5 rounded-full py-1 ps-1 pe-2.5 text-xs font-bold whitespace-nowrap transition-all hover:-translate-y-px focus-visible:ring-2 focus-visible:outline-none"
                      >
                        {i === 0 ? (
                          <span className="from-gold-soft to-gold-deep text-navy-deep flex size-6 items-center justify-center rounded-full bg-linear-to-br shadow-[0_4px_10px_-4px_rgba(193,147,87,.9)]">
                            <HomeIcon />
                          </span>
                        ) : null}
                        <span className="from-gold-deep to-gold truncate bg-linear-to-l bg-size-[0%_2px] bg-position-[0_100%] bg-no-repeat pb-0.5 transition-[background-size] duration-300 hover:bg-size-[100%_2px]">
                          {item.name}
                        </span>
                      </Link>
                    ) : (
                      <span className="text-navy/50 dark:text-wheat/50 truncate px-2 py-1 text-xs font-bold">
                        {item.name}
                      </span>
                    )}
                  </li>
                </Fragment>
              );
            })}
          </ol>
        </div>
      </nav>
    </>
  );
}

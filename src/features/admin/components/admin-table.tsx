"use client";

import { Inbox } from "lucide-react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type AdminCol<T> = {
  key: string;
  title: ReactNode;
  /** عرض ستون در الگوی گرید دسکتاپ؛ مانند 1.6fr یا 11rem. */
  width?: string;
  align?: "start" | "center" | "end";
  /** محتوای مهم ستون در ردیف دسکتاپ. */
  render: (row: T) => ReactNode;
  /** ستون در نمای کارت موبایل پنهان شود. */
  hideMobile?: boolean;
  /** ستون کم‌اهمیت در جدول فشردهٔ تبلت پنهان شود. */
  hideTablet?: boolean;
  /** رندر اختصاصی برای کارت موبایل. */
  renderMobile?: (row: T) => ReactNode;
};

const ALIGN: Record<NonNullable<AdminCol<never>["align"]>, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

/**
 * جدول واکنش‌گرای پنل:
 * - جدول کامل و ستونی در دسکتاپ عریض
 * - جدول فشرده با ستون‌های اولویت‌دار در تبلت و لپ‌تاپ کوچک
 * - رکورد سلولی متراکم فقط در موبایل
 * - بدون اسکرول افقی صفحه و قابل استفاده از عرض ۳۲۰px
 */
export function AdminTable<T extends { id: string | number }>({
  cols,
  rows,
  empty = "موردی برای نمایش وجود ندارد.",
  onRowClick,
  footer,
  header,
  minWidth = "60rem",
  className,
}: {
  cols: AdminCol<T>[];
  rows: T[];
  empty?: ReactNode;
  onRowClick?: (row: T) => void;
  footer?: ReactNode;
  header?: ReactNode;
  /** حداقل عرض شبکه داخلی دسکتاپ؛ اسکرول فقط داخل قاب جدول رخ می‌دهد. */
  minWidth?: string;
  className?: string;
}) {
  const templateFor = (columns: AdminCol<T>[]) => columns.map((column) => (column.width ?? "1fr").replace(/^([\d.]+)fr$/, "minmax(0, $1fr)")).join(" ");
  const gridStyle: CSSProperties = { gridTemplateColumns: templateFor(cols) };
  const tabletCols = cols.filter((column) => !column.hideTablet);
  const tabletGridStyle: CSSProperties = { gridTemplateColumns: templateFor(tabletCols) };
  const mobileCols = cols.filter((column) => !column.hideMobile);
  const primary = mobileCols[0];
  const details = mobileCols.slice(1).filter((column) => column.key !== "actions");
  const actions = mobileCols.find((column) => column.key === "actions");

  function onKeyDown(event: KeyboardEvent<HTMLElement>, row: T) {
    if (!onRowClick || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    onRowClick(row);
  }

  return (
    <section className={cn("border border-navy/13 rounded-[22px] max-[639px]:rounded-[19px] bg-paper/94 backdrop-blur-[18px] shadow-[0_24px_55px_-38px_rgba(14,42,71,0.46),inset_0_1px_0_rgba(255,255,255,0.8)] dark:border-gold-soft/24 dark:bg-[rgba(16,43,70,0.72)] dark:shadow-[0_28px_65px_-38px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.055),0_0_35px_rgba(193,147,87,0.025)] animate-admin-reveal motion-reduce:animate-none overflow-hidden", className)}>
      {header ? <div className="border-b border-navy/11 bg-[linear-gradient(to_left,rgba(193,147,87,0.055),transparent_42%)] px-4 py-3.5 sm:px-5 dark:border-gold-soft/16 dark:bg-[linear-gradient(to_left,rgba(232,197,122,0.055),transparent_42%)]">{header}</div> : null}

      {rows.length > 0 ? (
        <>
          {/* دسکتاپ عریض: جدول ستونی. اسکرول احتمالی فقط داخل همین قاب است. */}
          <div className="hidden min-[1360px]:block" role="grid" aria-label="جدول اطلاعات">
            <div className="overflow-x-auto [scrollbar-width:thin] [scrollbar-color:rgba(193,147,87,0.78)_rgba(14,42,71,0.04)] [&::-webkit-scrollbar]:h-[9px] [&::-webkit-scrollbar-track]:bg-navy/[0.045] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-[linear-gradient(to_right,var(--color-gold-deep),var(--color-gold-light))] [&::-webkit-scrollbar-thumb]:bg-clip-padding dark:[&::-webkit-scrollbar-track]:bg-gold-soft/[0.04]">
              <div style={{ minWidth }}>
                <div className="grid text-[rgba(255,248,236,0.9)] border-b border-[rgba(232,197,122,0.26)] bg-[linear-gradient(100deg,rgba(193,147,87,0.14),transparent_42%),var(--color-navy)] shadow-[inset_0_-1px_0_rgba(4,20,39,0.24)] dark:text-[rgba(255,248,236,0.88)] dark:border-[rgba(232,197,122,0.23)] dark:bg-[linear-gradient(100deg,rgba(193,147,87,0.12),transparent_45%),rgba(4,20,39,0.86)]" style={gridStyle} role="row">
                  {cols.map((column) => (
                    <div
                      key={column.key}
                      role="columnheader"
                      className={cn("min-w-0 whitespace-nowrap px-3.5 py-3 text-[10px] font-black tracking-wide [&:not(:last-child)]:border-e [&:not(:last-child)]:border-[rgba(255,248,236,0.105)] dark:[&:not(:last-child)]:border-[rgba(232,197,122,0.12)]", ALIGN[column.align ?? "start"])}
                    >
                      {column.title}
                    </div>
                  ))}
                </div>

                <div className="" role="rowgroup">
                  {rows.map((row, index) => (
                    <div
                      key={row.id}
                      role="row"
                      tabIndex={onRowClick ? 0 : undefined}
                      style={{ ...gridStyle, "--row-index": index } as CSSProperties}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      onKeyDown={(event) => onKeyDown(event, row)}
                      className={cn("relative grid min-h-[60px] items-stretch border-b border-[rgba(14,42,71,0.095)] bg-white/34 opacity-0 [animation:var(--animate-admin-row-in)] [animation-delay:calc(var(--row-index,0)*42ms)] transition-[background-color,box-shadow] duration-[220ms] ease-[cubic-bezier(.25,.1,.25,1)] even:bg-navy/[0.022] last:border-b-0 motion-reduce:opacity-100 motion-reduce:[animation:none] hover:z-10 hover:bg-gold/[0.09] hover:shadow-[inset_3px_0_0_var(--color-gold),inset_-3px_0_0_rgba(193,147,87,0.32),0_8px_24px_-20px_rgba(14,42,71,0.5)] focus-visible:z-10 focus-visible:bg-gold/[0.09] focus-visible:shadow-[inset_3px_0_0_var(--color-gold),inset_-3px_0_0_rgba(193,147,87,0.32),0_8px_24px_-20px_rgba(14,42,71,0.5)] dark:border-[rgba(232,197,122,0.125)] dark:bg-[rgba(4,20,39,0.17)] dark:even:bg-gold-soft/[0.024] dark:hover:bg-gold-soft/[0.07] dark:focus-visible:bg-gold-soft/[0.07]", onRowClick && "cursor-pointer")}
                    >
                      {cols.map((column) => (
                        <div
                          key={column.key}
                          role="cell"
                          className={cn("flex min-w-0 flex-col justify-center px-3.5 py-2.5 text-[12px] font-bold leading-5 text-navy [&:not(:last-child)]:border-e [&:not(:last-child)]:border-[rgba(14,42,71,0.075)] dark:text-ivory dark:[&:not(:last-child)]:border-[rgba(232,197,122,0.105)] 2xl:text-[13px]", ALIGN[column.align ?? "start"])}
                        >
                          {column.render(row)}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* تبلت و لپ‌تاپ کوچک: جدول واقعی با ستون‌های اولویت‌دار، بدون اسکرول افقی. */}
          <div className="hidden min-[700px]:block min-[1360px]:hidden" role="grid" aria-label="جدول اطلاعات">
            <div className="grid text-[rgba(255,248,236,0.9)] border-b border-[rgba(232,197,122,0.26)] bg-[linear-gradient(100deg,rgba(193,147,87,0.14),transparent_42%),var(--color-navy)] shadow-[inset_0_-1px_0_rgba(4,20,39,0.24)] dark:text-[rgba(255,248,236,0.88)] dark:border-[rgba(232,197,122,0.23)] dark:bg-[linear-gradient(100deg,rgba(193,147,87,0.12),transparent_45%),rgba(4,20,39,0.86)]" style={tabletGridStyle} role="row">
              {tabletCols.map((column) => (
                <div
                  key={column.key}
                  role="columnheader"
                  className={cn("min-w-0 whitespace-nowrap px-3 py-3 text-[9px] font-black [&:not(:last-child)]:border-e [&:not(:last-child)]:border-[rgba(255,248,236,0.105)] dark:[&:not(:last-child)]:border-[rgba(232,197,122,0.12)]", ALIGN[column.align ?? "start"])}
                >
                  {column.title}
                </div>
              ))}
            </div>
            <div className="" role="rowgroup">
              {rows.map((row, index) => (
                <div
                  key={row.id}
                  role="row"
                  tabIndex={onRowClick ? 0 : undefined}
                  style={{ ...tabletGridStyle, "--row-index": index } as CSSProperties}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={(event) => onKeyDown(event, row)}
                  className={cn("relative grid min-h-[58px] items-stretch border-b border-[rgba(14,42,71,0.095)] bg-white/34 opacity-0 [animation:var(--animate-admin-row-in)] [animation-delay:calc(var(--row-index,0)*42ms)] transition-[background-color,box-shadow] duration-[220ms] ease-[cubic-bezier(.25,.1,.25,1)] even:bg-navy/[0.022] last:border-b-0 motion-reduce:opacity-100 motion-reduce:[animation:none] hover:z-10 hover:bg-gold/[0.09] hover:shadow-[inset_3px_0_0_var(--color-gold),inset_-3px_0_0_rgba(193,147,87,0.32),0_8px_24px_-20px_rgba(14,42,71,0.5)] focus-visible:z-10 focus-visible:bg-gold/[0.09] focus-visible:shadow-[inset_3px_0_0_var(--color-gold),inset_-3px_0_0_rgba(193,147,87,0.32),0_8px_24px_-20px_rgba(14,42,71,0.5)] dark:border-[rgba(232,197,122,0.125)] dark:bg-[rgba(4,20,39,0.17)] dark:even:bg-gold-soft/[0.024] dark:hover:bg-gold-soft/[0.07] dark:focus-visible:bg-gold-soft/[0.07]", onRowClick && "cursor-pointer")}
                >
                  {tabletCols.map((column) => (
                    <div
                      key={column.key}
                      role="cell"
                      className={cn("flex min-w-0 flex-col justify-center px-3 py-2 text-[11px] font-bold leading-5 text-navy [&:not(:last-child)]:border-e [&:not(:last-child)]:border-[rgba(14,42,71,0.075)] dark:text-ivory dark:[&:not(:last-child)]:border-[rgba(232,197,122,0.105)]", ALIGN[column.align ?? "start"])}
                    >
                      {column.render(row)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* موبایل واقعی: رکورد فشرده با شبکهٔ سلولی، نه فرم بلند. */}
          <div className="grid gap-2 p-2 bg-[linear-gradient(rgba(14,42,71,0.022)_1px,transparent_1px),rgba(14,42,71,0.018)] bg-[size:100%_34px] dark:bg-[linear-gradient(rgba(232,197,122,0.022)_1px,transparent_1px),rgba(4,20,39,0.24)] sm:p-2.5 min-[700px]:hidden">
            {rows.map((row, index) => (
              <article
                key={row.id}
                role={onRowClick ? "button" : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={(event) => onKeyDown(event, row)}
                className={cn("overflow-hidden border border-[rgba(14,42,71,0.14)] rounded-[14px] bg-[rgba(255,255,255,0.86)] shadow-[0_10px_24px_-22px_rgba(14,42,71,0.52),inset_0_1px_0_rgba(255,255,255,0.85)] opacity-0 [animation:var(--animate-admin-row-in)] [animation-delay:calc(var(--row-index,0)*45ms)] transition-[transform,border-color,box-shadow] duration-[220ms] ease-[cubic-bezier(.25,.1,.25,1)] hover:-translate-y-0.5 hover:border-[rgba(193,147,87,0.48)] hover:shadow-[0_22px_42px_-28px_rgba(14,42,71,0.56)] focus-visible:-translate-y-0.5 focus-visible:border-[rgba(193,147,87,0.48)] focus-visible:shadow-[0_22px_42px_-28px_rgba(14,42,71,0.56)] motion-reduce:opacity-100 motion-reduce:[animation:none] dark:border-[rgba(232,197,122,0.22)] dark:bg-[rgba(4,20,39,0.68)] dark:shadow-[0_18px_42px_-27px_rgba(0,0,0,0.94),inset_0_1px_0_rgba(255,255,255,0.04)]", onRowClick && "cursor-pointer")}
                style={{ "--row-index": index } as CSSProperties}
              >
                {primary ? (
                  <div className="flex min-w-0 items-center justify-between gap-2.5 px-3 py-2.5 min-h-[3.75rem] border-b border-[rgba(14,42,71,0.115)] bg-[linear-gradient(to_left,rgba(193,147,87,0.09),transparent_55%),rgba(14,42,71,0.025)] dark:border-[rgba(232,197,122,0.17)] dark:bg-[linear-gradient(to_left,rgba(193,147,87,0.085),transparent_58%),rgba(255,255,255,0.018)] sm:px-3.5">
                    <span className="sr-only">{primary.title}</span>
                    <div className={cn("min-w-0 flex-1 text-[13px] font-black text-navy dark:text-ivory", ALIGN[primary.align ?? "start"])}>
                      {(primary.renderMobile ?? primary.render)(row)}
                    </div>
                    {onRowClick ? (
                      <span className="shrink-0 rounded-md border border-gold/18 bg-gold/10 px-2 py-1 text-[8px] font-black text-gold-deep dark:text-gold-soft">مشاهده</span>
                    ) : null}
                  </div>
                ) : null}

                {details.length > 0 ? (
                  <dl className="grid grid-cols-2 bg-[rgba(14,42,71,0.025)] dark:bg-[rgba(4,20,39,0.28)]">
                    {details.map((column) => (
                      <div key={column.key} className="min-w-0 px-3 py-2 min-h-[2.75rem] border-b border-[rgba(14,42,71,0.105)] bg-[rgba(255,255,255,0.44)] transition-[background-color] duration-[180ms] odd:border-e odd:border-[rgba(14,42,71,0.105)] [&:last-child:nth-child(odd)]:col-span-full [&:last-child:nth-child(odd)]:border-e-0 [&>dd>*]:ms-auto hover:bg-gold/[0.075] dark:border-[rgba(232,197,122,0.145)] dark:bg-[rgba(16,43,70,0.22)] dark:odd:border-[rgba(232,197,122,0.145)] dark:hover:bg-gold-soft/[0.055] max-[340px]:flex max-[340px]:min-h-[2.65rem] max-[340px]:items-center max-[340px]:justify-between max-[340px]:gap-3">
                        <dt className="mb-0.5 text-[8px] font-black leading-4 text-navy/52 dark:text-wheat/72 max-[340px]:mb-0 max-[340px]:flex-none">{column.title}</dt>
                        <dd className="min-w-0 break-words text-[11px] font-extrabold leading-5 text-navy dark:text-ivory max-[340px]:min-w-0 max-[340px]:flex-1 max-[340px]:text-end">
                          {(column.renderMobile ?? column.render)(row)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                {actions ? (
                  <div className="border-t-0 bg-[rgba(14,42,71,0.025)] px-3 py-2 dark:bg-white/[0.018] sm:px-3.5">
                    <span className="sr-only">{actions.title}</span>
                    <div className="min-w-0">{(actions.renderMobile ?? actions.render)(row)}</div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="grid min-h-52 place-items-center px-5 py-10 text-center">
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-gold/12 text-gold">
              <Inbox className="size-5" />
            </span>
            <p className="mt-3 text-sm font-black text-navy/55 dark:text-wheat">{empty}</p>
          </div>
        </div>
      )}

      {footer ? <div className="border-t border-navy/8 px-4 py-3 dark:border-gold/15">{footer}</div> : null}
    </section>
  );
}

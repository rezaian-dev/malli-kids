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
    <section className={cn("admin-table-shell admin-enter overflow-hidden", className)}>
      {header ? <div className="admin-table-toolbar px-4 py-3.5 sm:px-5">{header}</div> : null}

      {rows.length > 0 ? (
        <>
          {/* دسکتاپ عریض: جدول ستونی. اسکرول احتمالی فقط داخل همین قاب است. */}
          <div className="hidden min-[1360px]:block" role="grid" aria-label="جدول اطلاعات">
            <div className="admin-table-scroll overflow-x-auto">
              <div style={{ minWidth }}>
                <div className="admin-table-head grid" style={gridStyle} role="row">
                  {cols.map((column) => (
                    <div
                      key={column.key}
                      role="columnheader"
                      className={cn("admin-table-head-cell min-w-0 whitespace-nowrap px-3.5 py-3 text-[10px] font-black tracking-wide", ALIGN[column.align ?? "start"])}
                    >
                      {column.title}
                    </div>
                  ))}
                </div>

                <div className="admin-table-body" role="rowgroup">
                  {rows.map((row, index) => (
                    <div
                      key={row.id}
                      role="row"
                      tabIndex={onRowClick ? 0 : undefined}
                      style={{ ...gridStyle, "--row-index": index } as CSSProperties}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      onKeyDown={(event) => onKeyDown(event, row)}
                      className={cn("admin-table-row grid min-h-[60px] items-stretch", onRowClick && "cursor-pointer")}
                    >
                      {cols.map((column) => (
                        <div
                          key={column.key}
                          role="cell"
                          className={cn("admin-table-cell flex min-w-0 flex-col justify-center px-3.5 py-2.5 text-[12px] font-bold leading-5 text-navy dark:text-ivory 2xl:text-[13px]", ALIGN[column.align ?? "start"])}
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
            <div className="admin-table-head grid" style={tabletGridStyle} role="row">
              {tabletCols.map((column) => (
                <div
                  key={column.key}
                  role="columnheader"
                  className={cn("admin-table-head-cell min-w-0 whitespace-nowrap px-3 py-3 text-[9px] font-black", ALIGN[column.align ?? "start"])}
                >
                  {column.title}
                </div>
              ))}
            </div>
            <div className="admin-table-body" role="rowgroup">
              {rows.map((row, index) => (
                <div
                  key={row.id}
                  role="row"
                  tabIndex={onRowClick ? 0 : undefined}
                  style={{ ...tabletGridStyle, "--row-index": index } as CSSProperties}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={(event) => onKeyDown(event, row)}
                  className={cn("admin-table-row admin-table-row-compact grid min-h-[58px] items-stretch", onRowClick && "cursor-pointer")}
                >
                  {tabletCols.map((column) => (
                    <div
                      key={column.key}
                      role="cell"
                      className={cn("admin-table-cell flex min-w-0 flex-col justify-center px-3 py-2 text-[11px] font-bold leading-5 text-navy dark:text-ivory", ALIGN[column.align ?? "start"])}
                    >
                      {column.render(row)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* موبایل واقعی: رکورد فشرده با شبکهٔ سلولی، نه فرم بلند. */}
          <div className="admin-table-mobile grid gap-2 p-2 sm:p-2.5 min-[700px]:hidden">
            {rows.map((row, index) => (
              <article
                key={row.id}
                role={onRowClick ? "button" : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={(event) => onKeyDown(event, row)}
                className={cn("admin-table-card", onRowClick && "cursor-pointer")}
                style={{ "--row-index": index } as CSSProperties}
              >
                {primary ? (
                  <div className="admin-table-card-head flex min-w-0 items-center justify-between gap-2.5 px-3 py-2.5 sm:px-3.5">
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
                  <dl className="admin-table-details grid grid-cols-2">
                    {details.map((column) => (
                      <div key={column.key} className="admin-table-field min-w-0 px-3 py-2">
                        <dt className="mb-0.5 text-[8px] font-black leading-4 text-navy/52 dark:text-wheat/72">{column.title}</dt>
                        <dd className="min-w-0 break-words text-[11px] font-extrabold leading-5 text-navy dark:text-ivory">
                          {(column.renderMobile ?? column.render)(row)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                {actions ? (
                  <div className="admin-table-actions px-3 py-2 sm:px-3.5">
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

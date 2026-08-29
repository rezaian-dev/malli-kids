"use client";

import type { CSSProperties, ReactNode } from "react";

export type AdminCol<T> = {
  key: string;
  title: ReactNode;
  /** عرضِ ستون در الگویِ گریدِ دسکتاپ — مثل "1.6fr" یا "11rem" */
  width?: string;
  align?: "start" | "center" | "end";
  render: (row: T) => ReactNode;
  /** در کارتِ موبایل نمایش داده نشود */
  hideMobile?: boolean;
  /** رندرِ اختصاصی برای کارتِ موبایل (پیش‌فرض: همان render) */
  renderMobile?: (row: T) => ReactNode;
};

const ALIGN: Record<NonNullable<AdminCol<never>["align"]>, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

/**
 * جدولِ یکدستِ پنل ادمین: سرستون و ردیف‌ها دقیقاً با یک الگویِ گریدِ مشترک
 * رندر می‌شوند، پس داده همیشه زیرِ سرتیترِ خودش می‌نشیند.
 * در عرضِ کم‌تر از lg هر ردیف به کارتِ موبایل تبدیل می‌شود (بدونِ اسکرولِ افقی).
 */
export function AdminTable<T extends { id: string | number }>({
  cols,
  rows,
  empty = "موردی برای نمایش وجود ندارد.",
  onRowClick,
  footer,
  minWidth = "60rem",
}: {
  cols: AdminCol<T>[];
  rows: T[];
  empty?: ReactNode;
  onRowClick?: (row: T) => void;
  footer?: ReactNode;
  /** حداقلِ عرضِ جدولِ دسکتاپ — کم‌تر از این، اسکرولِ افقیِ داخلی فعال می‌شود، نه فشرده‌شدن و تداخل */
  minWidth?: string;
}) {
  // minmax(0, …) تا حداقلِ محتوا نتواند عرضِ ستون‌ها را در سرستون و ردیف‌ها
  // متفاوت کند — تنها راهِ تضمینِ ترازِ دقیقِ داده زیرِ سرتیتر
  const template = cols.map((c) => (c.width ?? "1fr").replace(/^([\d.]+)fr$/, "minmax(0, $1fr)")).join(" ");
  const gridStyle: CSSProperties = { gridTemplateColumns: template };

  return (
    <div className="lux-card overflow-hidden">
      {rows.length > 0 ? (
        <>
          {/* دسکتاپ: اگر جا کم باشد اسکرولِ افقیِ داخلی — هرگز تداخلِ عنصرها */}
          <div className="hidden xl:block">
            <div className="overflow-x-auto">
            <div style={{ minWidth }}>
            <div
              className="grid border-b border-navy/10 bg-navy text-ivory dark:border-gold/25 dark:bg-navy-mid"
              style={gridStyle}
            >
              {cols.map((c) => (
                <div
                  key={c.key}
                  className={`min-w-0 whitespace-nowrap px-4 py-3 text-[11px] font-black tracking-wide ${ALIGN[c.align ?? "start"]}`}
                >
                  {c.title}
                </div>
              ))}
            </div>
            <div className="divide-y divide-navy/6 dark:divide-gold/15">
              {rows.map((r) => (
                <div
                  key={r.id}
                  style={gridStyle}
                  onClick={onRowClick ? () => onRowClick(r) : undefined}
                  className={`grid items-center transition-colors hover:bg-sand/70 dark:hover:bg-white/5 ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                >
                  {cols.map((c) => (
                    <div
                      key={c.key}
                      className={`min-w-0 px-4 py-3 text-[13px] font-bold text-navy dark:text-ivory ${ALIGN[c.align ?? "start"]}`}
                    >
                      {c.render(r)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            </div>
            </div>
            {footer}
          </div>

          {/* موبایل: کارتِ برچسب‌دار */}
          <div className="divide-y divide-navy/6 xl:hidden dark:divide-gold/15">
            {rows.map((r) => (
              <div
                key={r.id}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                role={onRowClick ? "button" : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                className={`w-full space-y-2.5 p-4 text-right ${onRowClick ? "cursor-pointer active:bg-sand/60 dark:active:bg-white/5" : ""}`}
              >
                {cols.map((c) =>
                  c.hideMobile ? null : (
                    <div key={c.key} className="flex items-center justify-between gap-3">
                      <span className="shrink-0 text-[11px] font-black text-navy/45 dark:text-wheat">{c.title}</span>
                      <span className={`min-w-0 text-[13px] font-bold text-navy dark:text-ivory ${ALIGN[c.align ?? "start"]}`}>
                        {(c.renderMobile ?? c.render)(r)}
                      </span>
                    </div>
                  ),
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="p-10 text-center text-sm font-bold text-navy/45 dark:text-wheat">{empty}</p>
      )}
    </div>
  );
}

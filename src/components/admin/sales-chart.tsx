"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";
import type { AdminOrder } from "@/types";
import { formatToman, toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dailySeries, monthlySeries, type SalesPoint } from "@/lib/admin/sales";

type Range = "month" | "week";

const W = 720;
const H = 240;
const PAD = { top: 22, right: 14, bottom: 30, left: 14 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const BASELINE = PAD.top + PLOT_H;

/** 📈 Smooth each point into one clean Bézier path. */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

export function SalesChart({ orders }: { orders: AdminOrder[] }) {
  const gid = useId().replace(/:/g, "");
  const [range, setRange] = useState<Range>("month");
  const [active, setActive] = useState<number | null>(null);
  const [reveal, setReveal] = useState(false);
  const lineRef = useRef<SVGPathElement>(null);
  const [dash, setDash] = useState(0);

  const points: SalesPoint[] = useMemo(
    () => (range === "month" ? monthlySeries(orders, 6) : dailySeries(orders, 7)),
    [orders, range],
  );

  const n = points.length;
  const maxV = Math.max(1, ...points.map((p) => p.value));

  const coords = useMemo(() => {
    return points.map((p, i) => ({
      x: n === 1 ? PAD.left + PLOT_W / 2 : PAD.left + (i / (n - 1)) * PLOT_W,
      y: PAD.top + (1 - p.value / maxV) * PLOT_H,
    }));
  }, [points, n, maxV]);

  const linePath = useMemo(() => smoothPath(coords), [coords]);
  const areaPath = useMemo(() => {
    if (!coords.length) return "";
    const first = coords[0];
    const last = coords[coords.length - 1];
    return `${smoothPath(coords)} L ${last.x} ${BASELINE} L ${first.x} ${BASELINE} Z`;
  }, [coords]);

  // ✨ Draw the path in, while respecting reduced motion.
  useEffect(() => {
    setActive(null);
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const len = lineRef.current?.getTotalLength?.() ?? 0;
    setDash(len);
    setReveal(false);
    if (reduce || !len) {
      setReveal(true);
      return;
    }
    const t = requestAnimationFrame(() => requestAnimationFrame(() => setReveal(true)));
    return () => cancelAnimationFrame(t);
  }, [linePath]);

  const total = points.reduce((s, p) => s + p.value, 0);
  const delta = useMemo(() => {
    if (n < 2) return null;
    const prev = points[n - 2].value;
    const last = points[n - 1].value;
    if (prev <= 0) return null;
    return Math.round(((last - prev) / prev) * 100);
  }, [points, n]);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!n) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const plotStart = PAD.left / W;
    const plotEnd = (W - PAD.right) / W;
    const f = Math.min(1, Math.max(0, (relX - plotStart) / (plotEnd - plotStart)));
    setActive(n === 1 ? 0 : Math.round(f * (n - 1)));
  }

  const gridY = [0, 0.25, 0.5, 0.75, 1].map((t) => PAD.top + t * PLOT_H);
  const activePoint = active !== null ? points[active] : null;
  const activeCoord = active !== null ? coords[active] : null;
  const tooltipLeft = activeCoord ? Math.min(88, Math.max(12, (activeCoord.x / W) * 100)) : 50;

  return (
    <section className="rounded-[22px] max-[639px]:rounded-[19px] border border-navy/9 bg-paper/94 shadow-[0_20px_48px_-34px_rgba(14,42,71,0.38),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[18px] transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:border-gold/40 hover:shadow-[0_24px_52px_-34px_rgba(14,42,71,0.44)] dark:border-gold-soft/16 dark:bg-[rgba(16,43,70,0.72)] dark:shadow-[0_25px_60px_-35px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,0.045),0_0_0_1px_rgba(193,147,87,0.025)] dark:hover:border-gold-soft/30 dark:hover:shadow-[0_28px_64px_-36px_rgba(0,0,0,0.88),0_0_34px_rgba(193,147,87,0.035)] p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="flex items-center gap-2 font-black text-navy dark:text-ivory">
            <TrendingUp className="size-4 text-gold" /> روند فروش
          </h2>
          {delta !== null ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-black",
                delta >= 0 ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400" : "bg-rose/15 text-rose",
              )}
            >
              {delta >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              {toFaDigits(Math.abs(delta))}٪
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-left sm:block">
            <p className="text-[10px] font-bold text-navy/45 dark:text-wheat">مجموع بازه</p>
            <p className="text-sm font-black text-gold-deep dark:text-gold-soft">{formatToman(total)} ت</p>
          </div>
          <Select value={range} onValueChange={(value) => setRange(value as Range)} dir="rtl">
            <SelectTrigger className="h-9 w-28 rounded-xl bg-white text-[10px] shadow-none dark:bg-navy-deep/45" aria-label="بازه نمودار فروش">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="month">نمای ماهانه</SelectItem>
              <SelectItem value="week">نمای روزانه</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {n === 0 ? (
        <div className="grid h-44 place-items-center rounded-2xl bg-navy/4 text-sm font-bold text-navy/45 dark:bg-navy-deep/50 dark:text-wheat">
          هنوز فروش پرداخت‌شده‌ای برای نمایش ثبت نشده است.
        </div>
      ) : (
        <div className="relative w-full" dir="ltr" onPointerMove={onMove} onPointerLeave={() => setActive(null)}>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "auto" }} role="img" aria-label="نمودار روند فروش">
            <defs>
              <linearGradient id={`area-${gid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.42" />
                <stop offset="55%" stopColor="var(--color-gold)" stopOpacity="0.14" />
                <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
              </linearGradient>
              <clipPath id={`plot-${gid}`}>
                <rect x="0" y="0" width={W} height={BASELINE + 1} />
              </clipPath>
            </defs>

            {/* gridlines */}
            {gridY.map((y, i) => (
              <line
                key={i}
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y}
                y2={y}
                className="text-navy/8 dark:text-gold/12"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray={i === gridY.length - 1 ? undefined : "4 6"}
              />
            ))}

            {/* area */}
            <path
              d={areaPath}
              fill={`url(#area-${gid})`}
              clipPath={`url(#plot-${gid})`}
              style={{ opacity: reveal ? 1 : 0, transition: "opacity 700ms ease-out" }}
            />

            {/* line */}
            <path
              ref={lineRef}
              d={linePath}
              fill="none"
              className="text-gold-deep dark:text-gold"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: dash || undefined,
                strokeDashoffset: reveal ? 0 : dash,
                transition: "stroke-dashoffset 900ms ease-out",
              }}
            />

            {/* crosshair + active dot */}
            {activeCoord ? (
              <>
                <line
                  x1={activeCoord.x}
                  x2={activeCoord.x}
                  y1={PAD.top}
                  y2={BASELINE}
                  className="text-gold/45"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
                <circle cx={activeCoord.x} cy={activeCoord.y} r="7" className="fill-gold/20" />
                <circle
                  cx={activeCoord.x}
                  cy={activeCoord.y}
                  r="4"
                  className="fill-white stroke-gold-deep dark:fill-navy-deep dark:stroke-gold"
                  strokeWidth="2.5"
                />
              </>
            ) : null}

            {/* x labels */}
            {coords.map((c, i) => (
              <text
                key={i}
                x={c.x}
                y={H - 10}
                textAnchor="middle"
                className={cn(
                  "text-[11px] font-bold",
                  i === active ? "fill-gold-deep dark:fill-gold-soft" : "fill-navy/45 dark:fill-wheat",
                )}
              >
                {points[i].label}
              </text>
            ))}
          </svg>

          {/* tooltip */}
          {activePoint && activeCoord ? (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-2xl border border-gold/30 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm dark:bg-navy-deep/95"
              style={{ left: `${tooltipLeft}%`, top: `${(activeCoord.y / H) * 100}%`, transform: "translate(-50%, calc(-100% - 12px))" }}
              dir="rtl"
            >
              <p className="text-[11px] font-black text-navy dark:text-ivory">
                {activePoint.label}
                {activePoint.sub ? <span className="text-navy/40 dark:text-wheat"> {activePoint.sub}</span> : null}
              </p>
              <p className="mt-0.5 text-sm font-black text-gold-deep dark:text-gold-soft">{formatToman(activePoint.value)} ت</p>
              <p className="text-[10px] font-bold text-navy/45 dark:text-wheat">{toFaDigits(activePoint.count)} سفارش</p>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}

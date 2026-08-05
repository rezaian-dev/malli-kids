"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/** 📜 A slim custom-scrollbar viewport, used for the admin sidebar nav.
 *  The caller wraps this in its own `relative overflow-hidden` box and
 *  draws the top/bottom fade edges there (see `admin-shell.tsx`). */
export function AdminSidebarScroller({
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
        className={cn(
          "h-full scrollbar-none overflow-y-auto overscroll-contain pe-2 [&::-webkit-scrollbar]:size-0",
          className,
        )}
      >
        {children}
      </div>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-[1.1rem] inset-e-0.75 z-5 w-1 rounded-full transition-[opacity,transform,width] duration-220",
          "bg-navy/[0.07] shadow-[inset_0_0_0_1px_rgba(14,42,71,0.04)]",
          "dark:bg-gold-soft/5.5 dark:shadow-[inset_0_0_0_1px_rgba(232,197,122,0.06)]",
          scroll.visible
            ? "scale-y-100 opacity-64 group-hover:w-1.25 group-hover:opacity-100"
            : "scale-y-88 opacity-0",
        )}
      >
        <span className="bg-gold/55 absolute inset-s-1/2 -top-2 size-1 -translate-x-1/2 rounded-full shadow-[0_0_7px_rgba(193,147,87,0.35)]" />
        <span className="bg-gold/55 absolute inset-s-1/2 -bottom-2 size-1 -translate-x-1/2 rounded-full shadow-[0_0_7px_rgba(193,147,87,0.35)]" />
        <span
          className={cn(
            "absolute inset-x-0 rounded-full transition-[top,height,filter] duration-180",
            "from-gold-light to-gold-deep bg-linear-to-b shadow-[0_0_0_1px_rgba(255,248,236,0.24),0_0_14px_rgba(193,147,87,0.38)] group-hover:brightness-112",
          )}
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

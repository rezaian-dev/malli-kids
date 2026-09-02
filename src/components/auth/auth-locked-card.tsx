import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** 🔒 Shows the phone/name a code was just sent to, while it's "locked in". */
export function LockedCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-3.5 py-3",
        "border-gold/30 bg-sand/80",
        "dark:border-gold/25 dark:bg-navy-deep/60",
      )}
    >
      <p className="text-gold text-[11px] font-black">{title}</p>
      <div className="text-navy dark:text-ivory mt-1 text-sm font-black">
        {children}
      </div>
    </div>
  );
}

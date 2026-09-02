import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** 🔘 One toolbar button in the rich editor. */
export function RichEditorTool({
  active,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "grid size-9 place-items-center rounded-xl border transition",
        active
          ? "border-gold/60 bg-gold/15 text-gold-deep dark:text-gold-soft"
          : "border-navy/10 text-navy/70 hover:border-gold/50 dark:border-gold/20 dark:bg-navy-mid dark:text-wheat bg-white",
      )}
    >
      {children}
    </button>
  );
}

import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

/** 👋 Sidebar/mobile-drawer logout button. */
export function AdminAccountFooter({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="border-navy/8 dark:border-gold/14 border-t p-3">
      <button
        type="button"
        onClick={onLogout}
        className={cn(
          "flex min-h-10 w-full items-center justify-center gap-2 rounded-xl px-3 text-[11px] font-black transition",
          "text-rose hover:bg-rose/9 focus-visible:bg-rose/9",
        )}
      >
        <LogOut className="size-4" /> خروج از پنل
      </button>
    </div>
  );
}

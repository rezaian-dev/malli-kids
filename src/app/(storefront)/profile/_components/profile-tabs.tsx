import { Headphones, Heart, Pencil, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProfileTab = "info" | "orders" | "wishlist" | "support";

const TABS = [
  { id: "orders", label: "سفارش‌های من", Icon: ShoppingBag },
  { id: "wishlist", label: "علاقه‌مندی‌ها", Icon: Heart },
  { id: "support", label: "پشتیبانی", Icon: Headphones },
  { id: "info", label: "اطلاعات حساب", Icon: Pencil },
] as const;

/** 🧭 The section switcher above the active profile panel. */
export function ProfileTabs({
  active,
  onChange,
}: {
  active: ProfileTab;
  onChange: (tab: ProfileTab) => void;
}) {
  return (
    <nav
      className={cn(
        "mt-6 flex flex-wrap gap-1.5 rounded-[18px] p-1.5",
        "bg-sand",
        "dark:bg-dusk-mid",
      )}
      aria-label="بخش‌های پنل کاربری"
    >
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          aria-pressed={active === id}
          className={cn(
            "inline-flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-[13px] font-extrabold transition-all duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-95",
            "text-navy dark:text-linen",
            active === id
              ? "bg-navy text-ivory dark:bg-gold dark:text-navy-deep motion-safe:hover:shadow-md"
              : "hover:bg-white/60 dark:hover:bg-white/5",
          )}
        >
          <Icon className="h-4 w-4" /> {label}
        </button>
      ))}
    </nav>
  );
}

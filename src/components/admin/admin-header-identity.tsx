import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { AdminIdentity } from "./admin-shell";

/** 🪪 The signed-in admin's avatar + name chip in the header. */
export function AdminHeaderIdentity({ profile }: { profile: AdminIdentity }) {
  const letter = profile.name.trim().charAt(0) || "م";
  return (
    <div
      className={cn(
        "flex h-10 min-w-0 items-center gap-2 rounded-xl border px-2.5 sm:px-3",
        "border-navy/8 bg-white/62 shadow-[0_10px_24px_-22px_rgba(14,42,71,0.55)]",
        "dark:border-gold/15 dark:bg-white/4 dark:shadow-[0_12px_28px_-22px_rgba(0,0,0,0.85)]",
      )}
      aria-label={`ادمین واردشده: ${profile.name}`}
    >
      <Avatar size="sm" className="ring-gold/25 shrink-0 ring-1">
        {profile.avatar ? (
          <AvatarImage src={profile.avatar} alt={`تصویر ${profile.name}`} />
        ) : null}
        <AvatarFallback className="bg-navy text-gold-soft text-[10px] font-black">
          {letter}
        </AvatarFallback>
      </Avatar>
      <span
        className={cn(
          "max-w-22 truncate text-[10px] font-black sm:max-w-40 sm:text-[11px]",
          "text-navy",
          "dark:text-ivory",
        )}
      >
        {profile.name}
      </span>
    </div>
  );
}

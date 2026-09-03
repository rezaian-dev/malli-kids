import { Phone, PhoneCall, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { adminGlassCard } from "@/lib/admin/admin-chrome";
import type { CollabRequest } from "@/lib/collab";

const STATUS_ACTION_BUTTON = "min-h-9 rounded-xl text-[10px]";

/** 🤝 One partnership request — contact info, message, and a status toggle. */
export function CollabCard({
  request,
  onToggleStatus,
}: {
  request: CollabRequest;
  onToggleStatus: () => void;
}) {
  const waiting = request.status === "در انتظار بررسی";

  return (
    <article className={cn(adminGlassCard, "p-4 sm:p-5")}>
      <span
        className={cn(
          "absolute inset-y-0 inset-s-0 w-1",
          waiting ? "bg-amber-400" : "bg-emerald-500",
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-xl font-black",
              "bg-navy text-gold",
              "dark:bg-gold/15 dark:text-gold-soft",
            )}
          >
            {request.name.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="text-navy dark:text-ivory truncate text-sm font-black">
              {request.name}
            </p>
            <a
              href={`tel:${request.phone}`}
              className={cn(
                "mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold",
                "text-navy/45 hover:text-gold",
                "dark:text-wheat",
              )}
              dir="ltr"
            >
              <Phone className="size-3" /> {request.phone}
            </a>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-lg px-2 py-1 text-[9px] font-black",
            waiting
              ? "bg-amber-500/12 text-amber-700 dark:text-amber-300"
              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
          )}
        >
          {request.status}
        </span>
      </div>

      <span
        className={cn(
          "mt-4 inline-flex rounded-lg px-2.5 py-1 text-[9px] font-black",
          "bg-sky-500/9 text-sky-700",
          "dark:text-sky-300",
        )}
      >
        {request.kind}
      </span>
      <p
        className={cn(
          "mt-2 min-h-20 rounded-2xl px-3.5 py-3 text-xs leading-7",
          "bg-navy/[0.032] text-navy/78",
          "dark:text-ivory/78 dark:bg-white/[0.032]",
        )}
      >
        {request.text}
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-navy/35 dark:text-wheat/55 text-[9px] font-bold">
          {request.at}
        </p>
        {waiting ? (
          <Button
            type="button"
            variant="navy"
            size="sm"
            className={STATUS_ACTION_BUTTON}
            onClick={onToggleStatus}
          >
            <PhoneCall className="size-3.5" /> ثبت تماس
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={STATUS_ACTION_BUTTON}
            onClick={onToggleStatus}
          >
            <RotateCcw className="size-3.5" /> بازگشت به انتظار
          </Button>
        )}
      </div>
    </article>
  );
}

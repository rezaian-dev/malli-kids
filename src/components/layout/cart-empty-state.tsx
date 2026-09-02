import { ShoppingBag, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** 🛒 Shown inside the cart sheet when there's nothing in it yet. */
export function CartEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <span
        className={cn(
          "grid size-24 place-items-center rounded-full",
          "from-gold-pale to-sand text-navy bg-linear-to-br",
          "dark:from-dusk-alt dark:to-dusk-mid dark:text-gold",
        )}
      >
        <ShoppingBag className="size-10" />
      </span>
      <div>
        <p className="text-navy dark:text-ivory text-base font-black">
          سبد شما خالی است
        </p>
        <p className="text-navy/70 dark:text-wheat/80 mx-auto mt-1.5 max-w-60 text-xs leading-6">
          کالکشن دوخت‌های تازه را ببینید؛ هر چه بپسندید همین‌جا برایتان نگه
          می‌داریم.
        </p>
      </div>
      <Badge className="bg-gold/15 text-gold rounded-full border-0 px-3 py-1 text-[10px] font-bold">
        <Sparkles className="me-1 size-3" /> نسخهٔ نمایشی
      </Badge>
    </div>
  );
}

import { FAQ } from "@/lib/data/pages";
import { toFaDigits } from "@/lib/format";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export function Faq() {
  return (
    <Accordion type="single" collapsible defaultValue="0" className="gap-3">
      {FAQ.map((f, i) => (
        <AccordionItem
          key={f.q}
          value={String(i)}
          className={cn(
            "overflow-hidden rounded-[22px] border px-2 not-last:border",
            "border-navy/8 bg-white/94",
            "dark:border-gold/25 dark:bg-slate/60",
          )}
        >
          <AccordionTrigger
            className={cn(
              "px-3 py-4 text-start font-black hover:no-underline",
              "text-navy",
              "dark:text-linen",
            )}
          >
            <span
              className={cn(
                "me-3 flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-black",
                "bg-gold/15 text-gold",
              )}
            >
              {toFaDigits(i + 1)}
            </span>
            <span className="flex-1">{f.q}</span>
          </AccordionTrigger>
          <AccordionContent className="text-navy/70 dark:text-khaki px-3 pb-4 text-sm leading-7">
            {f.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

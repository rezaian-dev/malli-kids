import { FAQ } from "@/lib/data/pages";
import { toFaDigits } from "@/lib/format";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function Faq() {
  return (
    <Accordion type="single" collapsible defaultValue="0" className="gap-3">
      {FAQ.map((f, i) => (
        <AccordionItem
          key={f.q}
          value={String(i)}
          className="border-navy/8 dark:border-gold/25 dark:bg-slate/60 overflow-hidden rounded-[22px] border bg-white/94 px-2 not-last:border"
        >
          <AccordionTrigger className="text-navy dark:text-linen px-3 py-4 text-start font-black hover:no-underline">
            <span className="bg-gold/15 text-gold me-3 flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-black">
              {toFaDigits(i + 1)}
            </span>
            <span className="flex-1">{f.q}</span>
          </AccordionTrigger>
          <AccordionContent className="text-navy/60 dark:text-khaki px-3 pb-4 text-sm leading-7">
            {f.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

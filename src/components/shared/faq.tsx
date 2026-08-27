import { FAQ } from "@/lib/data/pages";
import { toFaDigits } from "@/lib/format";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function Faq() {
  return (
    <Accordion type="single" collapsible defaultValue="0" className="gap-3">
      {FAQ.map((f, i) => (
        <AccordionItem
          key={f.q}
          value={String(i)}
          className="overflow-hidden rounded-[22px] border border-navy/8 bg-white/94 px-2 not-last:border dark:border-gold/25 dark:bg-slate/60"
        >
          <AccordionTrigger className="px-3 py-4 text-start font-black text-navy hover:no-underline dark:text-linen">
            <span className="me-3 flex size-8 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-xs font-black text-gold">
              {toFaDigits(i + 1)}
            </span>
            <span className="flex-1">{f.q}</span>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-4 text-sm leading-7 text-navy/60 dark:text-khaki">{f.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

"use client";

import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FIELD_FOCUS } from "@/lib/field";
import { cn } from "@/lib/utils";

export type MultiSelectProps = {
  id?: string;
  value: string[];
  onValueChange: (value: string[]) => void;
  options: readonly string[];
  placeholder?: string;
  /** Shown when some items are selected, e.g. «۳ مورد انتخاب شده». */
  selectedLabel?: (count: number) => string;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-labelledby"?: string;
};

/**
 * Multi-select built from the shadcn/ui primitives (Popover + Badge + Button-style
 * trigger) so it looks and behaves like Select, but keeps several values.
 *
 * Anti-jump rules (do not regress):
 * - `modal={false}` — a modal popover locks body scroll and Radix compensates
 *   with padding, which shifts the whole page sideways on open/close.
 * - The trigger has a fixed height and the selected badges are truncated, so
 *   picking items never grows the field or pushes the layout around.
 * - The content is exactly the trigger width and focus is kept on the trigger
 *   (`onOpenAutoFocus` prevented) — opening never scrolls the page.
 * - Open/close animations are disabled here so there is no flash or zoom.
 * - The check column is always rendered (empty when unselected), so toggling
 *   an option never shifts its label.
 */
export function MultiSelect({
  id,
  value,
  onValueChange,
  options,
  placeholder = "انتخاب کنید…",
  selectedLabel,
  className,
  "aria-invalid": ariaInvalid,
  "aria-labelledby": ariaLabelledby,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const listId = React.useId();

  function toggle(item: string) {
    onValueChange(
      value.includes(item)
        ? value.filter((selected) => selected !== item)
        : [...value, item],
    );
  }

  function clear(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    onValueChange([]);
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-invalid={ariaInvalid || undefined}
          aria-labelledby={ariaLabelledby}
          data-slot="multi-select-trigger"
          className={cn(
            "group/multi-select flex h-11 w-full items-center justify-between gap-2 rounded-2xl border px-3.5 text-sm font-bold shadow-none transition-[color,box-shadow,border-color] duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50",
            "border-navy/12 bg-white text-navy hover:border-gold/50 aria-invalid:border-rose",
            "dark:border-gold/25 dark:bg-navy-mid dark:text-ivory dark:hover:border-gold/50",
            FIELD_FOCUS,
            className,
          )}
        >
          {value.length > 0 ? (
            <span className="flex min-w-0 items-center gap-1.5 overflow-hidden">
              {value.slice(0, 2).map((item) => (
                <Badge
                  key={item}
                  variant="secondary"
                  className="max-w-28 shrink-0 truncate rounded-full bg-gold/15 px-2 text-[11px] font-black text-navy dark:text-ivory"
                >
                  {item}
                </Badge>
              ))}
              {value.length > 2 ? (
                <span className="shrink-0 text-[11px] font-black text-navy/70 dark:text-wheat">
                  {selectedLabel
                    ? selectedLabel(value.length)
                    : `+${value.length - 2}`}
                </span>
              ) : null}
            </span>
          ) : (
            <span className="truncate text-navy/70 dark:text-wheat/70">
              {placeholder}
            </span>
          )}
          <span className="flex shrink-0 items-center gap-1">
            {value.length > 0 ? (
              <span
                aria-hidden="true"
                onClick={clear}
                className="grid size-5 place-items-center rounded-full text-navy/60 transition hover:bg-rose/10 hover:text-rose dark:text-wheat/70"
              >
                <X className="size-3.5" />
              </span>
            ) : null}
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-gold transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        id={listId}
        role="listbox"
        aria-multiselectable="true"
        align="start"
        side="bottom"
        sideOffset={4}
        // Keep focus (and therefore the scroll position) exactly where it was.
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="w-(--radix-popover-trigger-width) min-w-(--radix-popover-trigger-width) animate-none overflow-hidden rounded-2xl border border-gold/25 p-1 shadow-xl duration-0 data-open:animate-none data-closed:animate-none"
      >
        <div className="max-h-60 overflow-y-auto overscroll-contain p-0.5">
          {options.map((item) => {
            const selected = value.includes(item);
            return (
              <button
                key={item}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => toggle(item)}
                className={cn(
                  "relative flex w-full cursor-pointer items-center rounded-xl py-2 ps-3 pe-9 text-sm font-bold outline-none select-none",
                  "text-navy hover:bg-gold/12 focus-visible:bg-gold/12 dark:text-ivory dark:hover:bg-gold/20",
                  selected &&
                    "bg-gold/15 text-gold-deep dark:bg-gold/20 dark:text-gold-soft",
                )}
              >
                <span className="absolute inset-e-3 flex size-4 items-center justify-center">
                  {selected ? <Check className="size-4" /> : null}
                </span>
                {item}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

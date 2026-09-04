"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { FIELD_FOCUS_WITHIN } from "@/lib/field";
import { cn } from "@/lib/utils";

export type ComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  options: readonly string[];
  placeholder?: string;
  emptyText?: string;
  id?: string;
  className?: string;
  invalid?: boolean;
  "aria-required"?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

/** ✍️ Type-ahead combobox — the visible field *is* the search box (no
 *  separate popover search input, unlike the old cmdk-style pattern this
 *  replaced): typing filters the suggestion list live, and whatever's
 *  typed is the value whether or not it matches a suggestion — picking one
 *  from the list is a shortcut, never a requirement to submit. */
export function Combobox({
  value,
  onChange,
  onOpenChange,
  options,
  placeholder = "تایپ کنید…",
  emptyText = "نتیجه‌ای یافت نشد — همین متن ثبت می‌شود.",
  id,
  className,
  invalid,
  ...aria
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listId = React.useId();

  const filtered = React.useMemo(() => {
    const q = value.trim();
    return q ? options.filter((o) => o.includes(q)) : options;
  }, [options, value]);

  function setOpenState(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
    if (next) setActive(0);
  }

  function pick(city: string) {
    onChange(city);
    setOpenState(false);
    inputRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpenState(true);
      else setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (open) setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && filtered[active]) {
        e.preventDefault();
        pick(filtered[active]);
      } else {
        // ✅ Nothing highlighted (or the list is closed) — Enter just
        // confirms whatever text is already typed, free-form.
        setOpenState(false);
      }
    } else if (e.key === "Escape") {
      setOpenState(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpenState}>
      <PopoverAnchor asChild>
        <div
          data-field-shell
          className={cn(
            "group/combobox flex items-center gap-2 rounded-2xl border",
            "bg-white text-navy transition-[color,box-shadow,border-color] duration-200",
            "dark:bg-navy-mid dark:text-ivory",
            invalid
              ? "border-rose"
              : "border-navy/12 hover:border-gold/50 dark:border-gold/25 dark:hover:border-gold/50",
            FIELD_FOCUS_WITHIN,
            className,
          )}
        >
          <input
            ref={inputRef}
            id={id}
            {...aria}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-invalid={invalid || undefined}
            aria-activedescendant={
              open && filtered.length > 0 ? `${listId}-opt-${active}` : undefined
            }
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              if (!open) setOpenState(true);
            }}
            onFocus={() => setOpenState(true)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            className="placeholder:text-navy/70 dark:placeholder:text-wheat/70 h-full w-full min-w-0 bg-transparent text-sm font-bold outline-none"
          />
          <ChevronDown
            aria-hidden
            onMouseDown={(e) => {
              // 🖱️ A plain click would blur the input first (closing the
              // popover via its own onOpenChange) and only then fire this
              // handler — preventing default keeps focus in the input so
              // toggling the chevron and toggling by typing feel the same.
              e.preventDefault();
              setOpenState(!open);
              inputRef.current?.focus();
            }}
            className="text-gold size-4 shrink-0 cursor-pointer transition-transform duration-200 group-data-open/combobox:rotate-180"
          />
        </div>
      </PopoverAnchor>

      <PopoverContent
        align="start"
        // 🩹 Radix's Popper primitives expose `--radix-popper-anchor-width`
        // (not `-popover-`) — the wrong name here silently fell through to
        // `PopoverContent`'s own `w-72`, capping this list at ~288px no
        // matter how wide the field actually was.
        className="w-(--radix-popper-anchor-width) overflow-hidden p-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <ul
          id={listId}
          role="listbox"
          className="scrollbar-thin max-h-64 overflow-y-auto"
        >
          {filtered.length === 0 ? (
            <li className="text-navy/70 dark:text-wheat/70 px-3 py-6 text-center text-xs font-bold">
              {emptyText}
            </li>
          ) : (
            filtered.map((city, i) => (
              <li key={city}>
                <button
                  type="button"
                  id={`${listId}-opt-${i}`}
                  role="option"
                  aria-selected={city === value}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(city)}
                  className={cn(
                    "text-navy dark:text-ivory flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm font-bold",
                    i === active && "bg-gold/12 text-gold-deep dark:bg-gold/20 dark:text-gold-soft",
                    city === value && "text-gold-deep dark:text-gold-soft",
                  )}
                >
                  {city}
                  {city === value ? <Check className="size-4 shrink-0" /> : null}
                </button>
              </li>
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

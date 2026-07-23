"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DatePicker, { type DatePickerRef } from "react-multi-date-picker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { toFaDigits } from "@/lib/locale/fa";
import { jalaliParts } from "@/lib/locale/jalali";
import { cn } from "@/lib/utils";

export type JalaliDateFieldProps = {
  id: string;
  label: string;
  /** Jalali `YYYY/MM/DD` (latin or Persian digits — both parse). */
  value: string;
  /** Always a latin-digit `YYYY/MM/DD`, or `""`. */
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  /** Disallow picking before this Jalali date; `"today"` = from today on. */
  minDate?: "today" | string;
  className?: string;
};

function toDateObject(value: string): DateObject | null {
  const parts = jalaliParts(value);
  if (!parts) return null;
  return new DateObject({
    calendar: persian,
    locale: persian_fa,
    year: parts.y,
    month: parts.m,
    day: parts.d,
  });
}

/** 📅 Admin date field: pick-only Persian calendar (no typing). Themed in
 *  `admin.css`. Value contract stays the plain `YYYY/MM/DD` string. */
export function JalaliDateField({
  id,
  label,
  value,
  onChange,
  error,
  placeholder = "۱۴۰۵/۱۲/۲۹",
  required,
  minDate,
  className,
}: JalaliDateFieldProps) {
  const pickerRef = useRef<DatePickerRef | null>(null);
  const [open, setOpen] = useState(false);

  // Escape closes the calendar — captured at the document, before Radix's
  // own bubble-phase listener, so the dialog behind survives.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      const picker = pickerRef.current;
      if (!picker?.isOpen) return;
      event.preventDefault();
      event.stopPropagation();
      picker.closeCalendar();
    }
    document.addEventListener("keydown", onKeyDown, { capture: true });
    return () =>
      document.removeEventListener("keydown", onKeyDown, { capture: true });
  }, []);

  const dateValue = useMemo(() => toDateObject(value), [value]);
  const display = useMemo(() => toFaDigits(value), [value]);

  const minDateObject = useMemo(() => {
    if (!minDate) return undefined;
    if (minDate === "today")
      return new DateObject({ calendar: persian, locale: persian_fa });
    return toDateObject(minDate) ?? undefined;
  }, [minDate]);

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <label
        className="text-navy/70 dark:text-wheat block text-xs font-black"
        htmlFor={id}
      >
        {label}
      </label>
      <DatePicker
        ref={pickerRef}
        calendar={persian}
        locale={persian_fa}
        format="YYYY/MM/DD"
        value={dateValue}
        minDate={minDateObject}
        editable={false}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        onChange={(date) => {
          const picked = Array.isArray(date) ? date[0] : date;
          if (!picked) {
            onChange("");
            return;
          }
          const month = Number(picked.month.number);
          const day = Number(picked.day);
          onChange(
            `${picked.year}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`,
          );
        }}
        mapDays={({ date }) => {
          if (date.weekDay.index === 6) return { className: "malli-weekend" };
          return {};
        }}
        // NOTE: deliberately *not* `portal` — a body portal lands outside
        // Radix's modal dialog, where `body{pointer-events:none}` makes it
        // unclickable. Inline, the popup lives inside the dialog.
        calendarPosition="bottom-center"
        className="malli-jalali"
        containerClassName="malli-jalali-field"
        headerOrder={["LEFT_BUTTON", "MONTH_YEAR", "RIGHT_BUTTON"]}
        onOpenPickNewDate={false}
        renderButton={(
          direction: "left" | "right",
          handleClick: () => void,
          disabled?: boolean,
        ) => (
          <button
            type="button"
            disabled={disabled}
            onClick={handleClick}
            aria-label={direction === "right" ? "ماه بعد" : "ماه قبل"}
            className="malli-jalali-nav"
          >
            {direction === "right" ? (
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            ) : (
              <ChevronRight className="size-4" strokeWidth={2.4} />
            )}
          </button>
        )}
        render={(_renderValue, openCalendar) => (
          <button
            type="button"
            id={id}
            onClick={() => openCalendar()}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            aria-required={required || undefined}
            className={cn(
              "flex h-11 w-full min-w-0 items-center gap-2.5 rounded-2xl border px-3.5 text-sm",
              "border-navy/12 bg-transparent",
              "dark:border-gold/20",
              "text-navy dark:text-ivory",
              "transition-[border-color,box-shadow] outline-none",
              "hover:border-gold/45",
              "focus-visible:border-gold focus-visible:ring-gold/30 focus-visible:ring-3",
              !display && "text-navy/45 dark:text-wheat/50",
              className,
            )}
          >
            <CalendarDays
              aria-hidden="true"
              className="text-gold-deep dark:text-gold-soft size-5 shrink-0"
            />
            <span dir="ltr" className="min-w-0 flex-1 truncate text-left tracking-wide">
              {display || placeholder}
            </span>
          </button>
        )}
      />
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-rose text-xs font-bold"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

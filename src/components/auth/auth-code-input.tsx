"use client";

import { useState, type Ref } from "react";
import { cn } from "@/lib/utils";
import { OTP_LEN } from "@/lib/auth/schemas";
import { onlyDigits } from "./auth-shared";

/** Use one real OTP input; the five boxes are visual only. */
export function OtpBoxes({
  value,
  onChange,
  invalid,
  id,
  name,
  describedBy,
  onBlur,
  inputRef,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  id: string;
  name: string;
  describedBy?: string;
  onBlur: () => void;
  inputRef: Ref<HTMLInputElement>;
  disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [caret, setCaret] = useState(0);
  const digits = onlyDigits(value).slice(0, OTP_LEN);

  return (
    <div dir="ltr" className="relative mx-auto w-full max-w-72" data-otp-input>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        autoCapitalize="none"
        spellCheck={false}
        maxLength={32}
        value={digits}
        required
        disabled={disabled}
        aria-required="true"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className="absolute inset-0 z-10 h-full w-full cursor-text text-base opacity-0 disabled:cursor-not-allowed"
        onChange={(event) =>
          onChange(onlyDigits(event.target.value).slice(0, OTP_LEN))
        }
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur();
        }}
        onSelect={(event) =>
          setCaret(event.currentTarget.selectionStart ?? digits.length)
        }
      />
      <div aria-hidden="true" className="grid grid-cols-5 gap-2">
        {Array.from({ length: OTP_LEN }, (_, index) => (
          <span
            key={index}
            className={cn(
              "text-navy dark:bg-dusk-alt dark:text-ivory flex h-13 min-w-0 items-center justify-center rounded-xl border-2 bg-white text-lg font-black transition-[border-color,box-shadow]",
              invalid
                ? "border-rose dark:border-rose-light"
                : "border-navy/20 dark:border-gold/35",
              focused &&
                index === Math.min(caret, OTP_LEN - 1) &&
                "ring-gold/50 ring-offset-paper dark:ring-offset-dusk ring-2 ring-offset-2",
              disabled && "opacity-60",
            )}
          >
            {digits[index] || "\u00a0"}
          </span>
        ))}
      </div>
    </div>
  );
}

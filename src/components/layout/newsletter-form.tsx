"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/lib/toast";
import { FIELD_FOCUS_WITHIN } from "@/lib/field";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const trimmed = email.trim();
  const invalid = trimmed !== "" && !EMAIL_RE.test(trimmed);
  const bad = submitted && invalid;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trimmed) return;
    setSubmitted(true);
    if (!EMAIL_RE.test(trimmed)) return;

    toast.success(`عضو خبرنامه شدید — کد ۱۰٪ تخفیف به ${trimmed} فرستاده شد`);
    setEmail("");
    setSubmitted(false);
  }

  return (
    <form
      action="/contact"
      method="get"
      noValidate
      aria-label="عضویت در خبرنامه"
      className={cn("w-full max-w-md", className)}
      onSubmit={handleSubmit}
    >
      <span
        className={cn(
          "flex h-13 items-center rounded-full border bg-white/10 p-1.5 backdrop-blur-md",
          "shadow-[0_18px_50px_-18px_rgba(193,147,87,0.55),0_8px_28px_-16px_rgba(0,0,0,0.55)]",
          "transition-[border-color,box-shadow] duration-300",
          FIELD_FOCUS_WITHIN,
          bad ? "border-rose focus-within:border-rose" : "border-white/20",
        )}
      >
        <input
          id="newsletter-email"
          type="email"
          dir="ltr"
          name="email"
          autoComplete="email"
          maxLength={120}
          placeholder="ایمیل شما…"
          aria-label="ایمیل"
          aria-invalid={bad || undefined}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (submitted && event.target.value.trim() === "") {
              setSubmitted(false);
            }
          }}
          className={cn(
            "h-10 min-w-0 flex-1 px-4",
            "newsletter-field caret-cream text-cream placeholder:text-taupe appearance-none rounded-full bg-transparent text-right text-sm shadow-none outline-none",
          )}
        />
        <button
          type="submit"
          className={cn(
            "group/nl inline-flex h-10 shrink-0 items-center gap-1 px-5",
            "bg-gold text-navy-deep rounded-full text-[13px] font-black shadow-[0_10px_24px_-12px_rgba(193,147,87,0.9)] transition-transform duration-200 hover:scale-[1.03] active:scale-95",
          )}
        >
          عضویت{" "}
          <ArrowLeft
            className={cn(
              "size-4",
              "transition-transform duration-200 group-hover/nl:-translate-x-0.5",
            )}
          />
        </button>
      </span>
    </form>
  );
}

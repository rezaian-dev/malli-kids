"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
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
          "flex h-13 items-center rounded-full border p-1.5 backdrop-blur-md",
          "bg-white/10 shadow-[0_18px_50px_-18px_rgba(193,147,87,0.55),0_8px_28px_-16px_rgba(0,0,0,0.55)]",
          "transition-[border-color,box-shadow] duration-300",
          "focus-within:border-gold/55 focus-within:shadow-[0_20px_56px_-16px_rgba(193,147,87,0.7),0_8px_28px_-14px_rgba(0,0,0,0.5)]",
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
          aria-invalid={bad || undefined}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (submitted && event.target.value.trim() === "") {
              setSubmitted(false);
            }
          }}
          className="newsletter-field caret-cream text-cream placeholder:text-taupe h-10 min-w-0 flex-1 rounded-full bg-transparent px-4 text-right text-sm outline-none autofill:shadow-[inset_0_0_0_1000px_rgb(14_42_71_/_0.96)] autofill:[-webkit-text-fill-color:var(--color-cream)]"
        />
        <button
          type="submit"
          className="group/nl bg-gold text-navy-deep inline-flex h-10 shrink-0 items-center gap-1 rounded-full px-5 text-[13px] font-black shadow-[0_10px_24px_-12px_rgba(193,147,87,0.9)] transition-transform duration-200 hover:scale-[1.03] active:scale-95"
        >
          عضویت{" "}
          <ArrowLeft className="size-4 transition-transform duration-200 group-hover/nl:-translate-x-0.5" />
        </button>
      </span>
    </form>
  );
}

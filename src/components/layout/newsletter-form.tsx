"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 🪶 Tiny footer form without heavy form libs.
export function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const trimmed = email.trim();

  const bad = submitted
    ? trimmed === "" || !EMAIL_RE.test(trimmed)
    : trimmed !== "" && !EMAIL_RE.test(trimmed);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!trimmed || !EMAIL_RE.test(trimmed)) return;

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
          "flex items-center rounded-full border p-1.5 transition-all duration-300",
          "focus-within:border-gold/60 focus-within:bg-white/10 focus-within:shadow-[0_0_0_4px_rgba(196,147,87,.18)]",
          bad
            ? "border-rose focus-within:border-rose bg-white/10 focus-within:shadow-[0_0_0_4px_rgba(225,29,72,.16)]"
            : "border-white/20 bg-white/5",
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
          onChange={(event) => setEmail(event.target.value)}
          onBlur={() => setSubmitted(true)}
          className="newsletter-field text-cream placeholder:text-taupe h-10 min-w-0 flex-1 rounded-full bg-transparent px-4 text-right text-sm outline-none autofill:bg-transparent autofill:shadow-[0_0_0_1000px_transparent_inset] autofill:[-webkit-text-fill-color:var(--color-cream)]"
        />
        <button
          type="submit"
          className="group/nl bg-gold text-navy-deep inline-flex h-10 shrink-0 items-center gap-1 rounded-full px-5 text-[13px] font-black transition-transform duration-200 hover:scale-[1.03] active:scale-95"
        >
          عضویت{" "}
          <ArrowLeft className="size-4 transition-transform duration-200 group-hover/nl:-translate-x-0.5" />
        </button>
      </span>
    </form>
  );
}

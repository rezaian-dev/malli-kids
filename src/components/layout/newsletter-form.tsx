import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// ✉️ Native footer form keeps signup fast and accessible.
export function NewsletterForm({ className }: { className?: string }) {
  return (
    <form
      action="/contact"
      method="get"
      aria-label="عضویت در خبرنامه"
      className={cn("w-full max-w-md", className)}
    >
      <span className="flex items-center rounded-full border border-white/20 bg-white/5 p-1.5 transition-all duration-300 focus-within:border-gold/60 focus-within:bg-white/10 focus-within:shadow-[0_0_0_4px_rgba(196,147,87,.18)]">
        <input
          id="newsletter-email"
          type="email"
          dir="ltr"
          name="email"
          required
          autoComplete="email"
          maxLength={120}
          placeholder="ایمیل شما…"
          className="newsletter-field h-10 min-w-0 flex-1 rounded-full bg-transparent px-4 text-right text-sm text-cream outline-none placeholder:text-taupe autofill:bg-transparent autofill:shadow-[0_0_0_1000px_transparent_inset] autofill:[-webkit-text-fill-color:var(--color-cream)]"
        />
        <button
          type="submit"
          className="group/nl inline-flex h-10 shrink-0 items-center gap-1 rounded-full bg-gold px-5 text-[13px] font-black text-navy-deep transition-transform duration-200 hover:scale-[1.03] active:scale-95"
        >
          عضویت
          <ArrowLeft className="size-4 transition-transform duration-200 group-hover/nl:-translate-x-0.5" />
        </button>
      </span>
    </form>
  );
}

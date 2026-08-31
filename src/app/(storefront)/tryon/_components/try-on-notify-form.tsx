import { ArrowLeft } from "lucide-react";

// 📬 Native waitlist form keeps the coming-soon page very light.
export function NotifyForm() {
  return (
    <form
      action="/contact"
      method="get"
      aria-label="خبرم کن"
      className="mx-auto mt-7 w-full max-w-md"
    >
      <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 p-1.5 transition-colors focus-within:border-gold/60">
        <input
          id="tryon-notify-email"
          type="email"
          dir="ltr"
          name="email"
          required
          autoComplete="email"
          placeholder="ایمیل شما…"
          className="h-10 min-w-0 flex-1 rounded-full bg-transparent px-4 text-right text-sm text-cream outline-none placeholder:text-taupe"
        />
        <button
          type="submit"
          className="group inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-gold px-4 text-xs font-black text-navy-deep transition hover:scale-[1.03]"
        >
          خبرم کن
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
        </button>
      </span>
    </form>
  );
}

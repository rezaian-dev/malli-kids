"use client";

import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AppForm, Field, useAppForm } from "@/components/form";
import { notifyDefaults, notifySchema, type NotifyValues } from "@/lib/forms";
import { cn } from "@/lib/utils";

/**
 * عضویت در خبرنامهٔ فوتر.
 * بدونِ JavaScript هم کار می‌کند: فرم با GET به /contact می‌رود (action) و
 * اعتبارسنجیِ zod فقط وقتی فعال است که اسکریپت‌ها بالا آمده باشند.
 */
export function NewsletterForm({ className }: { className?: string }) {
  const form = useAppForm({ schema: notifySchema, defaultValues: notifyDefaults });

  function onValid({ email }: NotifyValues) {
    // TODO: عضویت را به سرویسِ خبرنامه وصل کنید.
    toast.success(`عضو خبرنامه شدید — کد ۱۰٪ تخفیف به ${email} فرستاده شد`);
    form.reset();
  }

  return (
    <AppForm form={form} onSubmit={onValid} action="/contact" method="get" ariaLabel="عضویت در خبرنامه" className={cn("w-full max-w-md", className)}>
      <Field name="email" label="ایمیل شما برای عضویت در خبرنامه" labelClassName="sr-only" skin="inset" noShell className="min-w-0">
        {({ field, invalid, id, describedBy }) => (
          <span
            className={cn(
              "flex items-center rounded-full border p-1.5 transition-all duration-300",
              "focus-within:border-gold/60 focus-within:bg-white/10 focus-within:shadow-[0_0_0_4px_rgba(196,147,87,.18)]",
              invalid ? "border-rose bg-white/10" : "border-white/20 bg-white/5",
            )}
          >
            <input
              id={id}
              type="email"
              dir="ltr"
              name="email"
              autoComplete="email"
              placeholder="ایمیل شما…"
              aria-invalid={invalid || undefined}
              aria-describedby={describedBy}
              value={(field.value as string) ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              className="newsletter-field h-10 min-w-0 flex-1 rounded-full bg-transparent px-4 text-right text-sm text-cream outline-none placeholder:text-taupe"
            />
            <button
              type="submit"
              className="group/nl inline-flex h-10 shrink-0 items-center gap-1 rounded-full bg-gold px-5 text-[13px] font-black text-navy-deep transition-transform duration-200 hover:scale-[1.03] active:scale-95"
            >
              عضویت <ArrowLeft className="size-4 transition-transform duration-200 group-hover/nl:-translate-x-0.5" />
            </button>
          </span>
        )}
      </Field>
    </AppForm>
  );
}

"use client";

import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AppForm, Field, useAppForm } from "@/components/form";
import { notifyDefaults, notifySchema, type NotifyValues } from "@/lib/forms";
import { cn } from "@/lib/utils";

export function NotifyForm() {
  const form = useAppForm({
    schema: notifySchema,
    defaultValues: notifyDefaults,
  });

  function notify({ email }: NotifyValues) {
    toast.success(`ثبت شد ✨ به‌محض آماده شدن، به ${email} خبر می‌دهیم`);
    form.reset();
  }

  return (
    <AppForm
      form={form}
      onSubmit={notify}
      ariaLabel="خبرم کن"
      className="mx-auto mt-7 w-full max-w-md"
      notify
    >
      <Field
        name="email"
        label="ایمیل شما برای اطلاع‌رسانی"
        labelClassName="sr-only"
        skin="inset"
        noShell
      >
        {({ field, invalid, id, describedBy }) => (
          <span
            className={cn(
              "flex items-center gap-1.5 rounded-full border bg-white/5 p-1.5 transition-colors",
              invalid
                ? "border-rose"
                : "focus-within:border-gold/60 border-white/20",
            )}
          >
            <input
              id={id}
              type="email"
              dir="ltr"
              autoComplete="email"
              placeholder="ایمیل شما…"
              aria-invalid={invalid || undefined}
              aria-describedby={describedBy}
              value={(field.value as string) ?? ""}
              name={field.name}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              className="text-cream placeholder:text-taupe h-10 min-w-0 flex-1 rounded-full bg-transparent px-4 text-right text-sm outline-none"
            />
            <button
              type="submit"
              className="group bg-gold text-navy-deep inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-xs font-black transition hover:scale-[1.03]"
            >
              خبرم کن{" "}
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            </button>
          </span>
        )}
      </Field>
    </AppForm>
  );
}

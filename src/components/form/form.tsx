"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  FormProvider,
  type FieldErrors,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";
import { toast } from "sonner";
import { toFaDigits } from "@/lib/format";
import { countErrors } from "@/lib/forms";
import { cn } from "@/lib/utils";

function errorPaths(errors: FieldErrors, prefix = "", depth = 0): string[] {
  const out: string[] = [];
  if (depth > 4) return out;
  for (const [key, value] of Object.entries(
    errors as Record<string, unknown>,
  )) {
    if (!value || typeof value !== "object") continue;
    const node = value as {
      message?: unknown;
      type?: unknown;
      errors?: FieldErrors;
    };
    if (node.message || node.type) out.push(prefix + key);
    else
      out.push(
        ...errorPaths(value as FieldErrors, `${prefix}${key}.`, depth + 1),
      );
  }
  return out;
}

const esc = (s: string) =>
  typeof CSS !== "undefined" && CSS.escape
    ? CSS.escape(s)
    : s.replace(/[^\w-]/g, "\\");

function focusFirstError(errors: FieldErrors) {
  if (typeof document === "undefined") return;
  const FOCUSABLE =
    'input:not([type="hidden"]), textarea, select, button, a[href], [tabindex]';
  const pick = (name: string) => {
    const wrap = document.querySelector<HTMLElement>(
      `[data-field="${esc(name)}"]`,
    );
    const direct = document.querySelector<HTMLElement>(`[name="${esc(name)}"]`);
    const inWrap = wrap?.querySelector<HTMLElement>(FOCUSABLE);
    if (inWrap) return inWrap;
    if (wrap?.matches(FOCUSABLE)) return wrap;
    if (direct?.matches(FOCUSABLE)) return direct;
    return wrap ?? direct;
  };
  const nodes = errorPaths(errors)
    .map(pick)
    .filter((n): n is HTMLElement => Boolean(n));
  if (!nodes.length) return;
  const el = nodes.reduce((a, b) =>
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? a : b,
  );
  el.focus({ preventScroll: true });

  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

export type AppFormProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  children: ReactNode;
  className?: string;
  id?: string;
  ariaLabel?: string;

  notify?: boolean;

  shake?: boolean;
  role?: "search" | "form";

  action?: string;
  method?: "get" | "post";

  shakeSignal?: number;

  onInvalid?: (errors: FieldErrors<T>) => void;
  resetOnSubmit?: boolean;
};

export function AppForm<T extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
  id,
  ariaLabel,
  role,
  notify,
  action,
  method,
  shake = true,
  onInvalid,
  shakeSignal,
  resetOnSubmit,
}: AppFormProps<T>) {
  const [shaking, setShaking] = useState(false);
  useEffect(() => {
    if (shakeSignal) setShaking(true);
  }, [shakeSignal]);

  return (
    <FormProvider {...form}>
      <form
        id={id}
        role={role}
        aria-label={ariaLabel}
        action={action}
        method={method}
        noValidate
        data-shaking={shaking ? "true" : undefined}
        className={cn(
          className,
          "[&[data-shaking=true]_[data-invalid=true]]:animate-shake",
        )}
        onAnimationEnd={(e) => {
          if (e.animationName === "shake") setShaking(false);
        }}
        onSubmit={form.handleSubmit(
          async (values) => {
            await onSubmit(values);
            if (resetOnSubmit) form.reset();
          },
          (errors) => {
            if (onInvalid) onInvalid(errors);
            else {
              const n = countErrors(errors as Record<string, unknown>);
              if (notify && n)
                toast.error(`${toFaDigits(n)} مورد را اصلاح کنید`);
            }
            if (shake) setShaking(true);
            focusFirstError(errors as FieldErrors);
          },
        )}
      >
        {children}
      </form>
    </FormProvider>
  );
}

export function FormHead({
  title,
  desc,
  className,
}: {
  title: ReactNode;
  desc?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="text-navy dark:text-linen text-lg font-black">{title}</h2>
      {desc ? (
        <p className="text-navy/50 dark:text-khaki mt-1 text-sm">{desc}</p>
      ) : null}
    </div>
  );
}

export { AppForm as Form };

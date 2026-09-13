"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import {
  FormProvider,
  type FieldErrors,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";
import { toast } from "@/lib/toast";
import { toFaDigits } from "@/lib/locale/fa";
import { countErrors } from "@/lib/forms";
import { cn } from "@/lib/utils";

function errorPaths(errors: FieldErrors, prefix = "", depth = 0): string[] {
  const out: string[] = [];
  if (depth > 4) return out;
  for (const [key, value] of Object.entries(
    errors as Record<string, unknown>,
  )) {
    if (!value || typeof value !== "object") continue;
    const node = value as { message?: unknown; type?: unknown };
    if (node.message || node.type) out.push(prefix + key);
    else
      out.push(
        ...errorPaths(value as FieldErrors, `${prefix}${key}.`, depth + 1),
      );
  }
  return out;
}

function focusFirstError(root: HTMLFormElement, errors: FieldErrors) {
  const focusable =
    'input:not([type="hidden"]):not(:disabled), textarea:not(:disabled), select:not(:disabled), button:not(:disabled), [tabindex]:not([tabindex="-1"])';
  // Scope to THIS form; a background checkout/profile can have the same field names.
  const nodes = errorPaths(errors).flatMap((name) => {
    const wrap = root.querySelector<HTMLElement>(
      `[data-field="${CSS.escape(name)}"]`,
    );
    const control =
      wrap?.querySelector<HTMLElement>(focusable) ??
      root.querySelector<HTMLElement>(`[name="${CSS.escape(name)}"]`);
    return control ? [{ control, wrap }] : [];
  });
  if (!nodes.length) {
    const summary = root.querySelector<HTMLElement>("[data-form-error]");
    summary?.focus({ preventScroll: true });
    summary?.scrollIntoView({
      behavior: "instant",
      block: "nearest",
      inline: "nearest",
    });
    return;
  }
  const first = nodes.reduce((a, b) =>
    a.control.compareDocumentPosition(b.control) &
    Node.DOCUMENT_POSITION_FOLLOWING
      ? a
      : b,
  );
  first.control.focus({ preventScroll: true });
  // Scroll the actual field, not the deliberately oversized inset input.
  (first.wrap ?? first.control).scrollIntoView({
    // Reveal the field before shaking; smooth scrolling can hide it under the tabs.
    behavior: "instant",
    block: "nearest",
    inline: "nearest",
  });
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
  busy?: boolean;
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
  busy,
  resetOnSubmit,
}: AppFormProps<T>) {
  const element = useRef<HTMLFormElement>(null);
  const submitting = useRef(false);
  const frame = useRef<number | null>(null);

  const feedback = useCallback(
    (errors?: FieldErrors) => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const root = element.current;
        if (!root) return;
        if (errors) focusFirstError(root, errors);
        if (
          !shake ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          return;
        // Shake only the outer field to avoid doubled movement and clipped borders.
        root
          .querySelectorAll<HTMLElement>('[data-field][data-invalid="true"]')
          .forEach((field) => {
            if (
              field.parentElement?.closest('[data-field][data-invalid="true"]')
            )
              return;
            field
              .getAnimations()
              .filter((animation) => animation.id === "field-validation")
              .forEach((animation) => animation.cancel());
            const animation = field.animate(
              [
                { transform: "translateX(0)" },
                { transform: "translateX(-5px)" },
                { transform: "translateX(5px)" },
                { transform: "translateX(-3px)" },
                { transform: "translateX(3px)" },
                { transform: "translateX(0)" },
              ],
              { duration: 450, easing: "ease-out" },
            );
            animation.id = "field-validation";
          });
      });
    },
    [shake],
  );

  useEffect(() => {
    if (shakeSignal) feedback(form.formState.errors);
  }, [shakeSignal, feedback]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );
  const serverError = form.formState.errors.root?.server?.message;
  useEffect(() => {
    if (serverError)
      feedback({
        root: { server: { type: "server", message: String(serverError) } },
      });
  }, [serverError, feedback]);

  return (
    <FormProvider {...form}>
      <form
        ref={element}
        id={id}
        role={role}
        aria-label={ariaLabel}
        action={action}
        method={method}
        noValidate
        data-app-form
        aria-busy={form.formState.isSubmitting || busy || undefined}
        className={cn("min-w-0", className)}
        onSubmit={async (event) => {
          event.preventDefault();
          // Ref guards even two clicks/Enter events before React paints disabled.
          if (submitting.current || busy) return;
          submitting.current = true;
          form.clearErrors("root.server");
          try {
            await form.handleSubmit(
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
                feedback(errors as FieldErrors);
              },
            )(event);
          } catch {
            form.setError("root.server", {
              type: "server",
              message: "ارتباط برقرار نشد؛ لطفاً دوباره تلاش کنید.",
            });
          } finally {
            submitting.current = false;
          }
        }}
      >
        {serverError ? (
          <p
            role="alert"
            data-form-error
            tabIndex={-1}
            className="border-rose/30 bg-rose/5 text-rose scroll-my-3 rounded-xl border px-3 py-2 text-xs leading-6 break-words"
          >
            {String(serverError)}
          </p>
        ) : null}
        {children}
      </form>
    </FormProvider>
  );
}

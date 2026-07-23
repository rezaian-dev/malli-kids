"use client";

import type { ComponentProps, ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button, type buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

export type SubmitButtonProps = Omit<ComponentProps<"button">, "type"> &
  VariantProps<typeof buttonVariants> & {
    /** Swapped in for `children` while the form is submitting — omit to
     *  just keep the original label and let the spinner + disabled state
     *  speak for themselves. */
    pendingLabel?: ReactNode;
  };

/** 🚦 The one place every `<AppForm>`'s submit button reads react-hook-form's
 *  own `formState.isSubmitting` — true for exactly as long as this form's
 *  async `onSubmit` is in flight (react-hook-form flips it around
 *  `handleSubmit`'s callback automatically; nothing here polls or times
 *  anything out, per the "no timeout/polling hacks" rule).
 *
 *  Disables the button and shows a spinner (+ optional `pendingLabel`) the
 *  moment submission starts, so the idle → editing → submitting → success/
 *  error state machine is visible on every `AppForm`-based form and a
 *  double-click can never fire the same submit twice — without each form
 *  wiring its own `useState`. Must render inside a `<AppForm>` (it reads the
 *  same react-hook-form context `<Field>` does). */
export function SubmitButton({
  children,
  pendingLabel,
  disabled,
  variant,
  size,
  ...props
}: SubmitButtonProps) {
  const { formState } = useFormContext();
  const pending = formState.isSubmitting;

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      disabled={pending || disabled}
      aria-busy={pending || undefined}
      {...props}
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {pendingLabel ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

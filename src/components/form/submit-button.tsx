"use client";

import type { ComponentProps, ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button, type buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

export type SubmitButtonProps = Omit<ComponentProps<typeof Button>, "type"> &
  VariantProps<typeof buttonVariants> & {
    /** Swapped in for `children` while the form is submitting — omit to
     *  just keep the original label and let the spinner + disabled state
     *  speak for themselves. */
    pendingLabel?: ReactNode;
  };

// 🚦 Every AppForm submit button — reads formState.isSubmitting, disables
// + spins, so no double-click ever refires; must sit inside <AppForm>
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

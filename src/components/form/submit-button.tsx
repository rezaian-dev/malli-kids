"use client";

import type { ComponentProps, ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button, type buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

export type SubmitButtonProps = Omit<ComponentProps<typeof Button>, "type"> &
  VariantProps<typeof buttonVariants> & {
    /** Optional label shown while submitting. */
    pendingLabel?: ReactNode;
  };

// Use AppForm's submitting state to prevent duplicate submissions.
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

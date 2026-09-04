"use client";

import { useId, type ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  ERROR_TEXT,
  HINT_TEXT,
  LABEL,
  LEAD,
  SHELL,
  SHELL_BARE_BAD,
  SHELL_BARE_IDLE,
  type Skin,
} from "./styles";
import { useField } from "./use-field";

export type FieldShellProps = {
  name: string;
  label?: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  skin?: Skin;
  className?: string;

  icon?: ReactNode;

  trailing?: ReactNode;

  noShell?: boolean;

  hideMessage?: boolean;

  labelClassName?: string;

  children: (p: {
    field: ReturnType<typeof useField>["field"];
    invalid: boolean;
    id: string;
    describedBy?: string;
  }) => ReactNode;
};

/** 🐚 The label + validation-shell + error/hint chrome every field type
 *  renders inside. `children` is a render-prop that gets the bound
 *  react-hook-form field — the field *types* below never call a hook
 *  themselves, only this shell does. */
export function Field({
  name,
  label,
  hint,
  required,
  skin = "admin",
  className,
  icon,
  trailing,
  noShell,
  hideMessage,
  labelClassName,
  children,
}: FieldShellProps) {
  const { field, fieldState } = useField(name);
  const uid = useId();
  const id = `f-${uid}-${name}`;
  const invalid = fieldState.invalid;
  const message = fieldState.error?.message;
  const shell = noShell ? undefined : SHELL[skin];
  const showMsg = Boolean(message) && !hideMessage;
  const showHint = !showMsg && Boolean(hint);

  const control = children({
    field,
    invalid,
    id,
    describedBy: showMsg ? `${id}-msg` : showHint ? `${id}-hint` : undefined,
  });

  return (
    <div
      className={cn("min-w-0 space-y-1.5", className)}
      data-field={name}
      data-invalid={invalid ? "true" : undefined}
    >
      {label ? (
        <Label htmlFor={id} className={cn(LABEL[skin], labelClassName)}>
          {label}
          {required ? <span className="text-rose"> *</span> : null}
        </Label>
      ) : null}

      {shell ? (
        <span
          data-field-shell
          data-skin={skin}
          className={cn(
            shell,
            skin === "bare" && (invalid ? SHELL_BARE_BAD : SHELL_BARE_IDLE),
          )}
          data-invalid={invalid ? "true" : undefined}
        >
          {icon ? (
            <span
              data-field-lead
              className={cn(LEAD[skin], "pointer-events-none relative z-10")}
            >
              {icon}
            </span>
          ) : null}
          {control}
          {trailing ? (
            <span
              data-field-trail
              className="relative z-10 ms-auto shrink-0 pe-1"
            >
              {trailing}
            </span>
          ) : null}
        </span>
      ) : (
        <>
          {icon}
          {control}
          {trailing}
        </>
      )}

      {showMsg ? (
        <p
          id={`${id}-msg`}
          role="alert"
          className="m-0 grid grid-rows-[1fr] opacity-100 transition-[grid-template-rows,opacity] duration-280 ease-[cubic-bezier(.25,.1,.25,1)] *:min-h-0 *:overflow-hidden starting:grid-rows-[0fr] starting:opacity-0"
        >
          <span className={ERROR_TEXT}>
            <CircleAlert className="mt-0.5 size-3 shrink-0" />
            <span>{message}</span>
          </span>
        </p>
      ) : showHint ? (
        <p id={`${id}-hint`} className={HINT_TEXT}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

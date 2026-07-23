import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { INPUT, LATIN_ANCHOR, type Skin } from "./styles";
import { Field } from "./field";
import { CharCount } from "./char-count";

export type TextFieldProps = {
  name: string;
  label?: ReactNode;
  hint?: ReactNode;
  skin?: Skin;
  className?: string;
  inputClassName?: string;
  type?: "text" | "email" | "password" | "search" | "url" | "tel";
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "tel" | "email";
  dir?: "rtl" | "ltr";
  maxLength?: number;
  icon?: ReactNode;

  trailing?: ReactNode;
  required?: boolean;

  showCount?: boolean;
};

export function TextField({
  name,
  label,
  hint,
  skin = "admin",
  className,
  inputClassName,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  dir,
  maxLength,
  icon,
  trailing,
  required,
  showCount,
}: TextFieldProps) {
  return (
    <Field
      name={name}
      label={label}
      hint={hint}
      skin={skin}
      required={required}
      className={className}
      icon={icon}
      trailing={trailing}
    >
      {({ field, invalid, id, describedBy }) => (
        <>
          <Input
            id={id}
            type={type}
            dir={dir}
            inputMode={inputMode}
            autoComplete={autoComplete}
            maxLength={maxLength}
            placeholder={placeholder}
            required={required}
            aria-required={required || undefined}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}

            className={cn(INPUT[skin], LATIN_ANCHOR, inputClassName)}
            value={(field.value as string | number | undefined) ?? ""}
            name={field.name}
            onChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
          />
          {showCount && maxLength ? (
            <CharCount value={String(field.value ?? "")} max={maxLength} />
          ) : null}
        </>
      )}
    </Field>
  );
}

/** 🪞 `TextField` pinned to the "inset" skin — used across auth/checkout forms. */
export function InsetField(props: TextFieldProps) {
  return <TextField skin="inset" {...props} />;
}

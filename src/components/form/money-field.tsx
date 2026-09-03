import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatFaMoney, parseFaNumber } from "@/lib/forms";
import { toEnDigits } from "@/lib/locale/fa";
import { Input } from "@/components/ui/input";
import { INPUT, LATIN_ANCHOR, type Skin } from "./styles";
import { Field } from "./field";

export function MoneyField({
  name,
  label,
  hint,
  skin = "admin",
  className,
  placeholder = "۰",
  required,
}: {
  name: string;
  label?: ReactNode;
  hint?: ReactNode;
  skin?: Skin;
  className?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <Field
      name={name}
      label={label}
      hint={hint}
      skin={skin}
      required={required}
      className={className}
    >
      {({ field, invalid, id, describedBy }) => (
        <Input
          id={id}
          dir="ltr"
          inputMode="numeric"
          autoComplete="off"
          placeholder={placeholder}
          required={required}
          aria-required={required || undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn(INPUT[skin], LATIN_ANCHOR, "tabular-nums")}
          value={formatFaMoney(parseFaNumber(field.value))}
          name={field.name}
          onChange={(e) =>
            field.onChange(toEnDigits(e.target.value).replace(/\D/g, ""))
          }
          onBlur={field.onBlur}
          ref={field.ref}
        />
      )}
    </Field>
  );
}

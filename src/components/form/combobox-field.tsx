import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Combobox } from "@/components/ui/combobox";
import { INPUT, type Skin } from "./styles";
import { Field } from "./field";

export type ComboboxFieldProps = {
  name: string;
  label?: ReactNode;
  hint?: ReactNode;
  skin?: Skin;
  className?: string;
  options: readonly string[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  required?: boolean;
};

export function ComboboxField({
  name,
  label,
  hint,
  skin = "admin",
  className,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
  required,
}: ComboboxFieldProps) {
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
        <Combobox
          id={id}
          value={(field.value as string) ?? ""}
          onChange={field.onChange}
          onOpenChange={(o) => !o && field.onBlur()}
          options={options}
          placeholder={placeholder}
          searchPlaceholder={searchPlaceholder}
          emptyText={emptyText}
          aria-required={required || undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn("w-full", INPUT[skin])}
        />
      )}
    </Field>
  );
}

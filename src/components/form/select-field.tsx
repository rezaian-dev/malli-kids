import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INPUT, type Skin } from "./styles";
import { Field } from "./field";

export type SelectFieldProps = {
  name: string;
  label?: ReactNode;
  hint?: ReactNode;
  skin?: Skin;
  className?: string;
  options: readonly (string | { value: string; label: string })[];
  placeholder?: string;
  required?: boolean;
};

export function SelectField({
  name,
  label,
  hint,
  skin = "admin",
  className,
  options,
  placeholder,
  required,
}: SelectFieldProps) {
  const items = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );
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
        <Select
          name={field.name}
          value={(field.value as string) ?? ""}
          onValueChange={field.onChange}
          onOpenChange={(o) => !o && field.onBlur()}
        >
          {/* ♿ Without `id` here, the Field's <label htmlFor> above points
              at nothing — the trigger renders as a button with no
              accessible name once a placeholder (not a real value) is
              showing. */}
          <SelectTrigger
            id={id}
            aria-required={required || undefined}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={cn("w-full", INPUT[skin])}
          >
            <SelectValue placeholder={placeholder ?? items[0]?.label} />
          </SelectTrigger>
          <SelectContent>
            {items.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </Field>
  );
}

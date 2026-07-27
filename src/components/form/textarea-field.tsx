import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { LATIN_ANCHOR, TEXTAREA } from "./styles";
import { Field } from "./field";
import { CharCount } from "./char-count";
import type { TextFieldProps } from "./text-field";

export type TextareaFieldProps = Omit<
  TextFieldProps,
  "type" | "icon" | "inputClassName"
> & {
  rows?: number;

  min?: number;
};

export function TextareaField({
  name,
  label,
  hint,
  skin = "admin",
  className,
  placeholder,
  autoComplete,
  maxLength,
  required,
  rows,
  min,
  showCount = true,
}: TextareaFieldProps) {
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
        <>
          <Textarea
            id={id}
            rows={rows}
            maxLength={maxLength}
            placeholder={placeholder}
            autoComplete={autoComplete}
            required={required}
            aria-required={required || undefined}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={cn(TEXTAREA[skin], LATIN_ANCHOR)}
            value={(field.value as string | undefined) ?? ""}
            name={field.name}
            onChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
          />
          {showCount && maxLength ? (
            <CharCount
              value={String(field.value ?? "")}
              max={maxLength}
              min={min}
            />
          ) : null}
        </>
      )}
    </Field>
  );
}

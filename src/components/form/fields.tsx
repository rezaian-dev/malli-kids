"use client";

import { useId, type ReactNode } from "react";
import { useController, useFormContext } from "react-hook-form";
import { CircleAlert } from "lucide-react";
import { toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import { formatFaMoney, parseFaNumber, toLatinDigits } from "@/lib/forms";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  COUNT_TEXT,
  LATIN_ANCHOR,
  LEAD,
  ERROR_TEXT,
  HINT_TEXT,
  INPUT,
  LABEL,
  SHELL,
  SHELL_BARE_BAD,
  SHELL_BARE_IDLE,
  TEXTAREA,
  type Skin,
} from "./styles";

/** فیلدها باید داخلِ `<AppForm>` باشند (از FormProvider می‌خوانند). */
function useField(name: string) {
  const form = useFormContext();
  if (!form) throw new Error("‹Field› باید داخل <AppForm> قرار بگیرد.");
  const { field, fieldState } = useController({ control: form.control as never, name: name as never });
  return { form, field, fieldState };
}

export type FieldShellProps = {
  name: string;
  label?: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  skin?: Skin;
  className?: string;
  /** آیکونِ ابتدایِ فیلد (فقط در پوسته‌های قاب‌دار) */
  icon?: ReactNode;
  /** دکمه‌ی انتهای فیلد، مثل نمایش/پنهانِ رمز */
  trailing?: ReactNode;
  /** قابِ خطی/باکسی را خاموش می‌کند (فیلدهایی که خودشان قاب دارند، مثل کد یکبارمصرف) */
  noShell?: boolean;
  /** پیامِ متنیِ خطا را نشان نده — فقط قاب/حاشیه قرمز (مثل ایمیلِ خبرنامه) */
  hideMessage?: boolean;
  /** کلاسِ خودِ برچسب (مثلاً «sr-only» وقتی برچسبِ تصویری نداریم) */
  labelClassName?: string;
  /** کنترل را خودتان می‌سازید (برای Select/ToggleGroup/InputOTP/…) */
  children: (p: { field: ReturnType<typeof useField>["field"]; invalid: boolean; id: string; describedBy?: string }) => ReactNode;
};

/**
 * قابِ مشترکِ همهٔ فیلدها: Label + کنترل + پیامِ خطا + راهنما.
 * بقیهٔ فیلدها فقط این را با یک کنترلِ مناسب پر می‌کنند.
 */
export function Field({ name, label, hint, required, skin = "admin", className, icon, trailing, noShell, hideMessage, labelClassName, children }: FieldShellProps) {
  const { field, fieldState } = useField(name);
  const uid = useId();
  const id = `f-${uid}-${name}`;
  const invalid = fieldState.invalid;
  const message = fieldState.error?.message;
  const shell = noShell ? undefined : SHELL[skin];
  const showMsg = Boolean(message) && !hideMessage;

  const control = children({
    field,
    invalid,
    id,
    describedBy: showMsg ? `${id}-msg` : undefined,
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
        <span data-field-shell className={cn(shell, skin === "bare" && (invalid ? SHELL_BARE_BAD : SHELL_BARE_IDLE))} data-invalid={invalid ? "true" : undefined}>
          {icon ? <span className={cn(LEAD[skin])}>{icon}</span> : null}
          {control}
          {trailing}
        </span>
      ) : (
        <>
          {icon}
          {control}
          {trailing}
        </>
      )}

      {showMsg ? (
        /* پوستهٔ grid-rows: ارتفاعِ پیامِ خطا به‌جای پرشِ ناگهانی، نرم باز می‌شود
           (جلوگیری از اسکرول/پرشِ عمودیِ لحظه‌ای، مثل لرزشِ کد OTP در مودال). */
        <p id={`${id}-msg`} role="alert" className="field-error m-0">
          <span className={ERROR_TEXT}>
            <CircleAlert className="mt-0.5 size-3 shrink-0" />
            <span>{message}</span>
          </span>
        </p>
      ) : hint ? (
        <p className={HINT_TEXT}>{hint}</p>
      ) : null}
    </div>
  );
}

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
  /** دکمهٔ انتهایِ فیلد (نمایشِ رمز و…) — فقط در پوسته‌های قاب‌دار */
  trailing?: ReactNode;
  required?: boolean;
  /** «۱۲ حرف باقی‌مانده» را زیرِ فیلد نشان می‌دهد */
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
    <Field name={name} label={label} hint={hint} skin={skin} required={required} className={className} icon={icon} trailing={trailing}>
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
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            // در چیدمانِ راست‌به‌چپ مقدار همیشه در «آغازِ» راست می‌نشیند؛ برایِ متنِ لاتین هم لازم است
            className={cn(INPUT[skin], LATIN_ANCHOR, inputClassName)}
            value={(field.value as string | number | undefined) ?? ""}
            name={field.name}
            onChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
          />
          {showCount && maxLength ? <CharCount value={String(field.value ?? "")} max={maxLength} /> : null}
        </>
      )}
    </Field>
  );
}

export type TextareaFieldProps = Omit<TextFieldProps, "type" | "icon" | "inputClassName"> & {
  rows?: number;
  /** حداقلِ طولِ مجاز — فقط برایِ شمارنده (قاعدهٔ اصلی در اسکیما است) */
  min?: number;
};

export function TextareaField({
  name,
  label,
  hint,
  skin = "admin",
  className,
  placeholder,
  maxLength,
  required,
  rows,
  min,
  showCount = true,
}: TextareaFieldProps) {
  return (
    <Field name={name} label={label} hint={hint} skin={skin} required={required} className={className}>
      {({ field, invalid, id, describedBy }) => (
        <>
          <Textarea
            id={id}
            rows={rows}
            maxLength={maxLength}
            placeholder={placeholder}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={cn(TEXTAREA[skin], LATIN_ANCHOR)}
            value={(field.value as string | undefined) ?? ""}
            name={field.name}
            onChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
          />
          {showCount && maxLength ? <CharCount value={String(field.value ?? "")} max={maxLength} min={min} /> : null}
        </>
      )}
    </Field>
  );
}

/** فیلدِ داخلِ باکس، با آیکون و دکمهٔ انتها (دیالوگ ورود/ثبت‌نام) */
export function InsetField(props: TextFieldProps) {
  return <TextField skin="inset" {...props} />;
}

/** فیلدِ عددیِ پولی: ارقامِ فارسی و جداکنندهٔ هزارگان را می‌فهمد و فارسی نشان می‌دهد. */
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
    <Field name={name} label={label} hint={hint} skin={skin} required={required} className={className}>
      {({ field, invalid, id, describedBy }) => (
        <Input
          id={id}
          dir="ltr"
          inputMode="numeric"
          autoComplete="off"
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn(INPUT[skin], LATIN_ANCHOR, "tabular-nums")}
          value={formatFaMoney(parseFaNumber(field.value))}
          name={field.name}
          onChange={(e) => field.onChange(toLatinDigits(e.target.value).replace(/\D/g, ""))}
          onBlur={field.onBlur}
          ref={field.ref}
        />
      )}
    </Field>
  );
}

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

export function SelectField({ name, label, hint, skin = "admin", className, options, placeholder, required }: SelectFieldProps) {
  const items = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <Field name={name} label={label} hint={hint} skin={skin} required={required} className={className}>
      {({ field, invalid }) => (
        <Select name={field.name} value={(field.value as string) ?? ""} onValueChange={field.onChange} onOpenChange={(o) => !o && field.onBlur()}>
          <SelectTrigger aria-invalid={invalid || undefined} className={cn("w-full", INPUT[skin])}>
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

export function SwitchField({
  name,
  label,
  description,
  className,
}: {
  name: string;
  label: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  const { field } = useField(name);
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-navy/10 px-4 py-3 transition-colors hover:border-gold/50 dark:border-gold/20",
        className,
      )}
      data-field={name}
    >
      <span className="min-w-0">
        <span className="block text-sm font-black text-navy dark:text-ivory">{label}</span>
        {description ? <span className="block text-[11px] font-bold text-navy/45 dark:text-wheat">{description}</span> : null}
      </span>
      <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} name={field.name} onBlur={field.onBlur} />
    </label>
  );
}

function CharCount({ value, max, min }: { value: string; max: number; min?: number }) {
  const n = value.trim().length;
  const left = max - value.length;
  return (
    <p className={cn(COUNT_TEXT, "text-left")} aria-live="polite">
      {left < 0 ? (
        <span className="text-rose">{toFaDigits(Math.abs(left))} حرف اضافه است</span>
      ) : min && n < min ? (
        <span>{toFaDigits(min - n)} حرف تا اعتبارسنجی</span>
      ) : (
        <span>
          {toFaDigits(n)} / {toFaDigits(max)}
        </span>
      )}
    </p>
  );
}

"use client";

import { useForm, type DefaultValues, type FieldValues, type Resolver, type UseFormProps, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

/** اسکیما: هر zodِ که خروجی‌اش شکلِ مقدارهای فرم باشد */
export type FormSchema<T extends FieldValues> = z.ZodType<T, FieldValues>;

/**
 * تنها نقطهٔ اتصالِ react-hook-form به zod — بقیهٔ فرم‌ها فقط همین را صدا می‌زنند.
 *
 * - `mode: "onTouched"`: تا فیلدی لمس نشده خطایی نمایش داده نمی‌شود (آزارنده نیست)،
 *   و بعد از آن هر کلید، نتیجه را زنده اصلاح می‌کند.
 * - اسکیماها `transform/coerce` ندارند، پس ورودی = خروجی و تایپ‌ها ساده می‌مانند.
 */
export function useAppForm<T extends FieldValues>(
  options: { schema: FormSchema<T>; defaultValues?: DefaultValues<T> } & Omit<UseFormProps<T>, "resolver" | "defaultValues">,
): UseFormReturn<T> {
  const { schema, defaultValues, ...rest } = options;
  return useForm<T>({
    // کستِ لازمِ[resolvers ↔ zod v4] فقط همین‌جا؛ در فایلِ فرم‌ها هیچ کستی نمی‌بینید.
    resolver: zodResolver(schema) as unknown as Resolver<T>,
    defaultValues,
    mode: "onTouched",
    // فوکوس را خودِ <AppForm> انجام می‌دهد: اولین فیلدِ نامعتبر در ترتیبِ صفحه
    // (React-hook-form بر اساسِ ترتیبِ ثبتِ فیلدها انتخاب می‌کند که می‌تواند فرق کند.)
    shouldFocusError: false,
    ...rest,
  });
}

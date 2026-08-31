"use client";

import { useForm, type DefaultValues, type FieldValues, type Resolver, type UseFormProps, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

export type FormSchema<T extends FieldValues> = z.ZodType<T, FieldValues>;

export function useAppForm<T extends FieldValues>(
  options: { schema: FormSchema<T>; defaultValues?: DefaultValues<T> } & Omit<UseFormProps<T>, "resolver" | "defaultValues">,
): UseFormReturn<T> {
  const { schema, defaultValues, ...rest } = options;
  return useForm<T>({
    
    resolver: zodResolver(schema) as unknown as Resolver<T>,
    defaultValues,
    mode: "onTouched",
    
    
    shouldFocusError: false,
    ...rest,
  });
}

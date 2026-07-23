"use client";

import { useController, useFormContext } from "react-hook-form";

/** 🧩 Binds a field name to the surrounding `<AppForm>`'s react-hook-form
 *  context. Throws outside a form — every `Field`-based component needs it. */
export function useField(name: string) {
  const form = useFormContext();
  if (!form) throw new Error("‹Field› باید داخل <AppForm> قرار بگیرد.");
  const { field, fieldState } = useController({
    control: form.control as never,
    name: name as never,
  });
  return { form, field, fieldState };
}

import { toLatinDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(value);
}

export function isIranianNationalId(value: string) {
  const code = toLatinDigits(value).trim();
  if (!/^\d{10}$/.test(code) || /^(\d)\1{9}$/.test(code)) return false;
  const check = Number(code[9]);
  let sum = 0;
  for (let index = 0; index < 9; index += 1) {
    sum += Number(code[index]) * (10 - index);
  }
  const rest = sum % 11;
  return rest < 2 ? check === rest : check === 11 - rest;
}

export const FIELD_LABEL = "text-navy/70 dark:text-wheat text-xs font-black";
export const FIELD_HINT = "text-navy/70 dark:text-wheat text-[11px] font-bold";
export const FIELD_ERROR = "text-rose text-xs font-bold";
export const SECTION_TITLE = "text-navy dark:text-linen text-lg font-black";
const FIELD_FOCUS_RING =
  "border-navy/12 focus:border-gold focus:shadow-[0_18px_50px_-14px_rgba(193,147,87,0.48),0_0_0_4px_rgba(193,147,87,0.16)] dark:border-gold/25 dark:focus:shadow-[0_18px_50px_-14px_rgba(232,197,122,0.32),0_0_0_4px_rgba(232,197,122,0.16)]";

function fieldState(error?: string) {
  return error ? "border-rose" : FIELD_FOCUS_RING;
}

export function inputClass(error?: string) {
  return cn(
    "h-11 w-full rounded-2xl border bg-transparent px-4 text-sm outline-none transition-[color,box-shadow,border-color] duration-200",
    "text-navy",
    "dark:text-ivory",
    fieldState(error),
  );
}

export function textAreaClass(error?: string) {
  return cn(
    "min-h-28 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none transition-[color,box-shadow,border-color] duration-200",
    "text-navy",
    "dark:text-ivory",
    fieldState(error),
  );
}

import { z } from "zod";
import { parseFaNumber, phoneDigits } from "./digits";
import { toEnDigits, toFaDigits } from "@/lib/locale/fa";

export { parseFaNumber, phoneDigits };

export const RE = {
  mobile: /^09\d{9}$/,
  email: /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/,
  postalCode: /^\d{10}$/,
} as const;

export const fa = {
  required: (label: string) => `${label} را وارد کنید`,
  min: (n: number, label = "متن") =>
    `${label} باید حداقل ${toFaDigits(n)} حرف باشد`,
  max: (n: number, label = "متن") =>
    `${label} حداکثر ${toFaDigits(n)} حرف می‌تواند باشد`,
  number: "عددِ معتبر وارد کنید",
  mobile: "شمارهٔ موبایل ۱۱ رقمی و با ۰۹ شروع می‌شود",
  email: "ایمیل را کامل وارد کنید (مثل name@mail.com)",
  postalCode: "کد پستی ۱۰ رقمی وارد کنید",
  range: (from: number, to: number) =>
    `مقدار باید بین ${toFaDigits(from)} و ${toFaDigits(to)} باشد`,
} as const;

export const text = (label: string, min = 2, max = 60) =>
  z
    .string({ error: () => fa.required(label) })
    .trim()
    .min(1, fa.required(label))
    .min(min, fa.min(min, label))
    .max(max, fa.max(max, label));

export const optText = (max = 60, label = "متن") =>
  z.string().trim().max(max, fa.max(max, label));

const optionalPattern = (test: (v: string) => boolean, message: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || test(v), message);

export const mobile = (label = "شمارهٔ موبایل") =>
  z
    .string({ error: () => fa.required(label) })
    .trim()
    .min(1, fa.required("شمارهٔ موبایل"))
    .refine((v) => RE.mobile.test(phoneDigits(v)), fa.mobile);

export const optMobile = () =>
  optionalPattern((v) => RE.mobile.test(phoneDigits(v)), fa.mobile);

export const email = (label = "ایمیل") =>
  z
    .string({ error: () => fa.required(label) })
    .trim()
    .min(1, fa.required("ایمیل"))
    .refine((v) => RE.email.test(v), fa.email);

export const postalCode = () =>
  optionalPattern((v) => RE.postalCode.test(toEnDigits(v)), fa.postalCode);

// 📏 Optional, plain numeric text (kept as a string like `childAge` — parsed
// with `parseFaNumber` at the point of use, e.g. `sizeForHeightCm`) — a
// child's height in a sane human range, or left blank entirely.
export const optHeightCm = (min = 40, max = 200) =>
  optionalPattern((v) => {
    const n = parseFaNumber(v);
    return Number.isFinite(n) && n >= min && n <= max;
  }, fa.range(min, max));

export const amount = (
  label: string,
  opts: { min?: number; max?: number } = {},
) => {
  const min = opts.min ?? 0;
  const max = opts.max ?? 500_000_000;
  return z
    .string({ error: () => fa.required(label) })
    .trim()
    .min(1, fa.required(label))
    .refine((v) => Number.isFinite(parseFaNumber(v)), fa.number)
    .refine(
      (v) => {
        const n = parseFaNumber(v);
        return n >= min && n <= max;
      },
      fa.range(min, max),
    );
};

export const percent = (min = 1, max = 90) =>
  z
    .string({ error: () => fa.required("درصد تخفیف") })
    .trim()
    .min(1, fa.required("درصد تخفیف"))
    .refine((v) => Number.isFinite(parseFaNumber(v)), fa.number)
    .refine(
      (v) => {
        const n = parseFaNumber(v);
        return Number.isInteger(n) && n >= min && n <= max;
      },
      fa.range(min, max),
    );

export const fullName = (opts: { required?: boolean } = {}) => {
  const required = opts.required ?? true;
  return z
    .string({ error: () => fa.required("نام و نام خانوادگی") })
    .trim()
    .min(required ? 1 : 0, fa.required("نام و نام خانوادگی"))
    .min(required ? 3 : 0, fa.min(3, "نام"))
    .max(60, fa.max(60, "نام و نام خانوادگی"))
    .refine(
      // ‌ (U+200C, نیم‌فاصله) در نام‌های ترکیبی فارسی خیلی رایج است، مثل «احمدی‌نژاد».
      (v) => v === "" || /^[\p{L}][\p{L}\s'’.‌-]+$/u.test(v),
      "فقط حروف و فاصله مجاز است",
    )
    .refine(
      (v) => !required || v.split(/\s+/).filter(Boolean).length >= 2,
      "نام و نام خانوادگی را کامل بنویسید",
    );
};

export const otpCode = (len = 5) =>
  z
    .string({ error: () => fa.required("کد تأیید") })
    .trim()
    .min(1, fa.required("کد تأیید"))
    .refine(
      (v) =>
        new RegExp(`^\\d{${len}}$`).test(toEnDigits(v).replace(/\s/g, "")),
      `کد ${toFaDigits(len)} رقمی را کامل وارد کنید`,
    );

export const password = (min = 6) =>
  z
    .string({ error: () => fa.required("رمز عبور") })
    .min(min, `رمز باید حداقل ${toFaDigits(min)} نویسه باشد`);

// 🔐 Registration/reset password: length + letter + number, the same bar
// Better Auth's account creation should hold callers to.
export const strongPassword = (min = 8) =>
  password(min)
    .refine((v) => /[A-Za-z]/.test(v), "رمز باید شامل حداقل یک حرف باشد")
    .refine((v) => /\d/.test(v), "رمز باید شامل حداقل یک عدد باشد");

export const longText = (label: string, min = 10, max = 600) =>
  z
    .string({ error: () => fa.required(label) })
    .trim()
    .min(1, fa.required(label))
    .min(min, `حداقل ${toFaDigits(min)} حرف بنویسید تا مفید باشد`)
    .max(max, fa.max(max, label));

export const list = (label: string, min = 1, max = 20) =>
  z
    .array(z.string().trim().min(1))
    .min(min, `${label} را حداقل یک مورد انتخاب کنید`)
    .max(max, `حداکثر ${toFaDigits(max)} مورد`);

export const notifySchema = z.object({ email: email("ایمیل") });
export type NotifyValues = z.infer<typeof notifySchema>;
export const notifyDefaults: NotifyValues = { email: "" };

export function countErrors(
  errors: Record<string, unknown> | undefined,
): number {
  if (!errors) return 0;
  return Object.values(errors).reduce<number>(
    (n, e) =>
      n +
      (e && typeof e === "object" && "type" in e ? 1 : 0) +
      countErrors((e as { errors?: Record<string, unknown> })?.errors),
    0,
  );
}

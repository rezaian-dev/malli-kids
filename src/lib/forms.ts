import { z } from "zod";
import { toFaDigits } from "./format";

const faDigits = Array.from({ length: 10 }, (_, i) =>
  String.fromCodePoint(0x06f0 + i),
);
const arDigits = Array.from({ length: 10 }, (_, i) =>
  String.fromCodePoint(0x0660 + i),
);
const FA = faDigits.join("");
const AR = arDigits.join("");

export function parseFaNumber(raw: unknown): number {
  if (typeof raw === "number") return raw;
  if (typeof raw !== "string") return Number.NaN;
  const s = toLatinDigits(raw).replace(/[\s,_٬]/g, "");
  if (!s || !/^\d+$/.test(s)) return Number.NaN;
  return Number(s);
}

export function toLatinDigits(v: string): string {
  return v
    .replace(/[\u06f0-\u06f9]/g, (d) => String(FA.indexOf(d)))
    .replace(/[\u0660-\u0669]/g, (d) => String(AR.indexOf(d)));
}

export function formatFaMoney(n: number): string {
  if (!Number.isFinite(n)) return "";
  return toFaDigits(n.toLocaleString("en-US")).replace(/,/g, "٬");
}

export function phoneDigits(v: string): string {
  const raw = toLatinDigits(v).replace(
    /[\s\u200c\u200e\u200f().٫،\u2010-\u2015_-]/g,
    "",
  );
  if (raw.startsWith("+98")) return `0${raw.slice(3)}`;
  if (raw.startsWith("0098")) return `0${raw.slice(4)}`;
  return raw;
}

export const RE = {
  mobile: /^09\d{9}$/,
  tel: /^0\d{2,3}\d{7,8}$/,
  email: /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/,
  nationalId: /^\d{10}$/,
  code: /^[A-Za-z0-9_-]{4,16}$/,
} as const;

export function isIranianNationalId(input: string): boolean {
  const code = toLatinDigits(input).trim();
  if (!/^\d{10}$/.test(code) || /^(\d)\1{9}$/.test(code)) return false;
  const d = Number(code[9]);
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(code[i]) * (10 - i);
  const r = sum % 11;
  return r < 2 ? d === r : d === 11 - r;
}

export function jalaliParts(
  input: string,
): { y: number; m: number; d: number } | null {
  const s = toLatinDigits(input)
    .trim()
    .replace(/[.\u200c\-]/g, "/");
  const m = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(s);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (y < 1300 || y > 1500) return null;
  if (mo < 1 || mo > 12) return null;
  if (d < 1 || d > (mo <= 6 ? 31 : mo <= 11 ? 30 : 29)) return null;
  return { y, m: mo, d };
}

export const fa = {
  required: (label: string) => `${label} را وارد کنید`,
  min: (n: number, label = "متن") =>
    `${label} باید حداقل ${toFaDigits(n)} حرف باشد`,
  max: (n: number, label = "متن") =>
    `${label} حداکثر ${toFaDigits(n)} حرف می‌تواند باشد`,
  number: "عددِ معتبر وارد کنید",
  mobile: "شمارهٔ موبایل ۱۱ رقمی و با ۰۹ شروع می‌شود",
  email: "ایمیل را کامل وارد کنید (مثل name@mail.com)",
  nationalId: "کد ملی ۱۰ رقمی و معتبر وارد کنید",
  jalali: "تاریخ شمسی را کامل بنویسید؛ ماه ۰۱ تا ۱۲ و روز تا ۳۱",
  code: "فقط حروف و عدد لاتین، بین ۴ تا ۱۶ نویسه",
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

export const telOrMobile = (label = "شمارهٔ تماس") =>
  z
    .string({ error: () => fa.required(label) })
    .trim()
    .min(1, fa.required("شمارهٔ تماس"))
    .refine(
      (v) => RE.mobile.test(phoneDigits(v)) || RE.tel.test(phoneDigits(v)),
      "شماره را با پیش‌شماره وارد کنید، مثل ۰۲۱۶۴۰۲۳۴",
    );

export const email = (label = "ایمیل") =>
  z
    .string({ error: () => fa.required(label) })
    .trim()
    .min(1, fa.required("ایمیل"))
    .refine((v) => RE.email.test(v), fa.email);

export const emailOrMobile = (label = "ایمیل یا موبایل") =>
  z
    .string({ error: () => fa.required(label) })
    .trim()
    .min(1, fa.required("ایمیل یا موبایل"))
    .refine(
      (v) =>
        RE.email.test(v.replace(/\s/g, "")) || RE.mobile.test(phoneDigits(v)),
      "ایمیل یا شمارهٔ موبایلِ ۰۹ را وارد کنید",
    );

export const nationalId = () =>
  optionalPattern(
    (v) => RE.nationalId.test(toLatinDigits(v)) && isIranianNationalId(v),
    fa.nationalId,
  );

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

export const optAmount = (opts: { min?: number; max?: number } = {}) => {
  const min = opts.min ?? 0;
  const max = opts.max ?? 500_000_000;
  return z
    .string()
    .trim()
    .refine((v) => v === "" || Number.isFinite(parseFaNumber(v)), fa.number)
    .refine(
      (v) => {
        if (v === "") return true;
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

export const jalaliDate = (label = "تاریخ") =>
  z
    .string({ error: () => fa.required(label) })
    .trim()
    .min(1, fa.required("تاریخ"))
    .refine((v) => jalaliParts(v) !== null, fa.jalali);

export const promoCode = () =>
  z
    .string({ error: () => fa.required("کد تخفیف") })
    .trim()
    .min(1, fa.required("کد تخفیف"))
    .refine((v) => RE.code.test(v), fa.code);

export const oneOf = <T extends readonly [string, ...string[]]>(
  values: T,
  label: string,
) => z.enum(values, { error: () => `${label} را انتخاب کنید` });

export const fullName = (opts: { required?: boolean } = {}) => {
  const required = opts.required ?? true;
  return z
    .string({ error: () => fa.required("نام و نام خانوادگی") })
    .trim()
    .min(required ? 1 : 0, fa.required("نام و نام خانوادگی"))
    .min(required ? 3 : 0, fa.min(3, "نام"))
    .max(60, fa.max(60, "نام و نام خانوادگی"))
    .refine(
      (v) => v === "" || /^[\p{L}][\p{L}\s'’.-]+$/u.test(v),
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
        new RegExp(`^\\d{${len}}$`).test(toLatinDigits(v).replace(/\s/g, "")),
      `کد ${toFaDigits(len)} رقمی را کامل وارد کنید`,
    );

export const password = (min = 6) =>
  z
    .string({ error: () => fa.required("رمز عبور") })
    .min(min, `رمز باید حداقل ${toFaDigits(min)} نویسه باشد`);

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

export function jalaliToday(): { y: number; m: number; d: number } {
  try {
    const parts = new Intl.DateTimeFormat("en-u-ca-persian", {
      numberingSystem: "latn",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const pick = (t: string) =>
      Number(parts.find((p) => p.type === t)?.value ?? 0);
    return { y: pick("year"), m: pick("month"), d: pick("day") };
  } catch {
    return { y: 1404, m: 1, d: 1 };
  }
}

export function isJalaliFuture(input: string): boolean {
  const p = jalaliParts(input);
  if (!p) return false;
  const t = jalaliToday();
  return p.y * 10000 + p.m * 100 + p.d > t.y * 10000 + t.m * 100 + t.d;
}

export function orderedRange<T extends z.ZodType>(
  schema: T,
  fromKey: string,
  toKey: string,
  message = "حداقلِ قیمت نمی‌تواند بیشتر از حداکثر باشد",
): T {
  return schema.superRefine((val: any, ctx) => {
    const a = parseFaNumber(val?.[fromKey]);
    const b = parseFaNumber(val?.[toKey]);
    if (val?.[fromKey] === "" || val?.[toKey] === "") return;
    if (Number.isFinite(a) && Number.isFinite(b) && a > b)
      ctx.addIssue({ code: "custom", path: [toKey], message });
  }) as T;
}

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

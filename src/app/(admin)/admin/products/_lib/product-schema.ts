import { z } from "zod";
import { CATS, SEASONS } from "@/lib/constants";
import {
  amount,
  longText,
  optAmount,
  optText,
  parseFaNumber,
  text,
} from "@/lib/forms";
import type { Product } from "@/types";

export const CAT_OPTIONS: string[] = CATS.filter((c) => c !== "همه");

const oneCat = z
  .string({ error: () => "دسته‌بندی را انتخاب کنید" })
  .refine((v) => CAT_OPTIONS.includes(v), "دسته‌بندی را انتخاب کنید");

export const productSchema = z
  .object({
    name: text("نام محصول", 3, 80),
    cat: oneCat,
    season: z.enum(SEASONS, { error: () => "زیرشاخه (فصل) را انتخاب کنید" }),
    price: amount("قیمت", { min: 1000, max: 500_000_000 }),
    old: optAmount({ min: 0, max: 500_000_000 }),
    disc: optText(20, "تخفیف"),
    badge: optText(20, "نشان"),
    desc: longText("توضیح", 15, 800),
    img: z.string(),
    stock: z.boolean(),
  })
  .superRefine((v, ctx) => {
    const now = parseFaNumber(v.price);
    const before = parseFaNumber(v.old);
    if (v.old !== "" && before <= now) {
      ctx.addIssue({
        code: "custom",
        path: ["old"],
        message: "قیمتِ قبل باید بیشتر از قیمتِ فعلی باشد",
      });
    }
    const off = v.disc.trim();
    if (off) {
      const n = parseFaNumber(off.replace(/[٪%\s]/g, ""));
      if (!Number.isFinite(n) || n < 1 || n > 99) {
        ctx.addIssue({
          code: "custom",
          path: ["disc"],
          message: "تخفیف را عدد بنویسید، مثل «۱۷٪»",
        });
      }
    }
  });

export type ProductValues = z.infer<typeof productSchema>;

export const productDefaults: ProductValues = {
  name: "",
  cat: CAT_OPTIONS[0],
  season: SEASONS[0],
  price: "",
  old: "",
  disc: "",
  badge: "",
  desc: "",
  img: "",
  stock: true,
};

export function productValues(p: Product): ProductValues {
  return {
    name: p.name,
    cat: p.cat,
    season: p.season ?? SEASONS[0],
    price: String(p.price),
    old: p.old ? String(p.old) : "",
    disc: p.disc ?? "",
    badge: p.badge ?? "",
    desc: p.desc ?? "",
    img: p.img ?? "",
    stock: p.stock,
  };
}

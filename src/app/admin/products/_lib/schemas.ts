import { z } from "zod";
import { CATS, GENDERS, SEASONS } from "@/lib/constants";

const CAT_OPTIONS = CATS.filter((item) => item !== "همه");

const productVariantSchema = z.object({
  size: z.string().trim().min(1).max(20),
  color: z.string().trim().max(30).optional(),
  stock: z.number().int().min(0).max(100_000),
});

/** 🧾 Mirrors `ProductForm`'s client-side validation — the client checks
 *  give fast feedback, this is the real boundary (see Next's Server Actions
 *  security guide: never trust client-shaped input). */
export const productSchema = z.object({
  name: z.string().trim().min(3).max(80),
  cat: z.enum(CAT_OPTIONS as unknown as [string, ...string[]]),
  gender: z.enum(GENDERS).optional(),
  ageRange: z.string().trim().max(40).optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(80)
    .regex(/^[a-z0-9-]*$/, "فقط حروف انگلیسی، عدد و خط تیره")
    .optional(),
  season: z.enum(SEASONS),
  price: z.number().int().min(1000).max(500_000_000),
  old: z.number().min(0).max(500_000_000).optional(),
  disc: z.string().trim().max(20).optional(),
  badge: z.string().trim().max(20).optional(),
  desc: z.string().trim().min(15).max(800),
  images: z.array(z.string().min(1)).min(1).max(6),
  stock: z.boolean(),
  // 🆕 Empty for legacy/unsized products — `stock` above keeps meaning
  // what it always has for them (see `deriveStock` in `@/lib/shop/inventory`).
  variants: z.array(productVariantSchema).max(40).default([]),
  // 🧵 "Complete the look" — other product ids to suggest as a matching
  // outfit on this product's page (see `getCompleteTheLook`). Deliberately
  // capped small: this is meant to be a hand-picked set, not a catalog dump.
  // 🐛 `.min(0)`, not `.positive()` — product ids are 0-indexed (the
  // seeded catalog's first product really is id `0`), and `.positive()`
  // silently rejected pairing with it, failing the *entire* save with a
  // generic error and no field-level hint why.
  pairsWith: z.array(z.number().int().min(0)).max(6).default([]),
  seoTitle: z.string().trim().max(70).optional(),
  seoDescription: z.string().trim().max(160).optional(),
  visible: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export type ProductValues = z.infer<typeof productSchema>;
export type ProductVariantValues = z.infer<typeof productVariantSchema>;

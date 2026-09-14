import { z } from "zod";
import { CATS, GENDERS, SEASONS } from "@/lib/constants";

const CAT_OPTIONS = CATS.filter((item) => item !== "همه");

const productVariantSchema = z.object({
  size: z.string().trim().min(1).max(20),
  color: z.string().trim().max(30).optional(),
  stock: z.number().int().min(0).max(100_000),
});

// Mirrors the client checks — this is the real boundary
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
  // Empty for legacy/unsized products — stock keeps its old meaning
  variants: z
    .array(productVariantSchema)
    .max(40)
    .default([])
    .refine(
      (rows) => new Set(rows.map((row) => row.size)).size === rows.length,
      "سایز تکراری مجاز نیست.",
    ),
  // Accept zero-based product IDs and limit manual pairings.
  pairsWith: z.array(z.number().int().min(0)).max(6).default([]),
  seoTitle: z.string().trim().max(70).optional(),
  seoDescription: z.string().trim().max(160).optional(),
  visible: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export type ProductValues = z.infer<typeof productSchema>;

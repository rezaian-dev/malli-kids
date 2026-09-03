import { z } from "zod";
import { CATS, SEASONS } from "@/lib/constants";

const CAT_OPTIONS = CATS.filter((item) => item !== "همه");

/** 🧾 Mirrors `ProductForm`'s client-side validation — the client checks
 *  give fast feedback, this is the real boundary (see Next's Server Actions
 *  security guide: never trust client-shaped input). */
export const productSchema = z.object({
  name: z.string().trim().min(3).max(80),
  cat: z.enum(CAT_OPTIONS as unknown as [string, ...string[]]),
  season: z.enum(SEASONS),
  price: z.number().int().min(1000).max(500_000_000),
  old: z.number().min(0).max(500_000_000).optional(),
  disc: z.string().trim().max(20).optional(),
  badge: z.string().trim().max(20).optional(),
  desc: z.string().trim().min(15).max(800),
  images: z.array(z.string().min(1)).min(1).max(6),
  stock: z.boolean(),
});

export type ProductValues = z.infer<typeof productSchema>;

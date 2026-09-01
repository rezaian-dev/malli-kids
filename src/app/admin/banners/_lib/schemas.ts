import { z } from "zod";

export const bannerPatchSchema = z
  .object({
    occasion: z.string().trim().min(1).max(40),
    title: z.string().trim().min(1).max(120),
    subtitle: z.string().trim().min(1).max(160),
    cta: z.string().trim().min(1).max(30),
    href: z.string().trim().min(1),
    coupon: z.string().trim().max(20).optional(),
    theme: z.enum(["navy", "gold", "night"]),
    from: z.string().trim().min(1),
    to: z.string().trim().min(1),
    active: z.boolean(),
    pinned: z.boolean(),
  })
  .partial();

export type BannerPatch = z.infer<typeof bannerPatchSchema>;

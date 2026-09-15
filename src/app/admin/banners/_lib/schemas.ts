import { z } from "zod";
import { isSafeHref } from "@/lib/utils";

export const bannerPatchSchema = z
  .object({
    occasion: z.string().trim().min(1).max(40),
    title: z.string().trim().min(1).max(120),
    subtitle: z.string().trim().min(1).max(160),
    cta: z.string().trim().min(1).max(30),
    // Rendered as a Link href for every visitor — allowlist safe targets only.
    href: z.string().trim().min(1).max(200).refine(isSafeHref, "نشانی معتبر نیست"),
    coupon: z.string().trim().max(20).optional(),
    theme: z.enum(["navy", "gold", "night"]),
    from: z.string().trim().min(1),
    to: z.string().trim().min(1),
    active: z.boolean(),
    pinned: z.boolean(),
  })
  .partial();

export type BannerPatch = z.infer<typeof bannerPatchSchema>;

import { z } from "zod";

/** 🧾 Mirrors `NewCouponDialog`'s client-side validation (see its
 *  `validateCouponForm`) — the real boundary for a value the client shaped. */
export const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Za-z0-9_-]{4,16}$/),
  title: z.string().trim().min(3).max(60),
  rate: z.number().min(0.01).max(0.9),
  cap: z.number().int().min(1).max(100_000),
  min: z.number().min(0).max(500_000_000),
  until: z.string().trim().min(1),
});

export type CouponValues = z.infer<typeof couponSchema>;

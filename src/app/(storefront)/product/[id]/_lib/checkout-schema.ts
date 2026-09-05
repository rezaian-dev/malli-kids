import { z } from "zod";

export const checkoutSchema = z.object({
  productId: z.number().int(),
  size: z.string().trim().min(1).max(10),
  qty: z.number().int().min(1).max(9),
  city: z.string().trim().min(2).max(60),
  address: z.string().trim().min(10).max(300),
  phone: z.string().regex(/^\d{11}$/),
  postalCode: z.string().regex(/^\d{10}$/),
  couponCode: z.string().trim().max(20).optional(),
  // 🔁 One key per checkout *attempt* (regenerated whenever the dialog
  // reopens, not per click) — lets the server collapse a double-submit or a
  // retried request into the order that already exists instead of creating
  // a second one. See `createOrder` in `lib/shop/orders.ts`.
  idempotencyKey: z.string().uuid().optional(),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;

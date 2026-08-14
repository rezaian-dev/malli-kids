import { z } from "zod";

// 🧾 Split out of `checkout-actions.ts` (a `"use server"` file): Next.js
// requires every export of a `"use server"` module to be an async function —
// a plain Zod schema object doesn't qualify. This was a latent violation
// (production `next build` didn't surface it, but Turbopack dev did once the
// action module graph shifted) rather than something both build modes always
// catch — kept here instead, same split as every other route's
// `schemas.ts`/`actions.ts` pair.
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
  // a second one. See `createOrder` in `@/lib/shop/orders`.
  idempotencyKey: z.string().uuid().optional(),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;

// 🛒 The whole-cart counterpart to `checkoutSchema` above: one order made of
// every line the shopper has in their cart, submitted together — the
// standard "checkout" a shopper expects, instead of having to open this same
// dialog once per line. Delivery/coupon fields are identical; only `items`
// changes shape (one line → many).
export const cartCheckoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int(),
        size: z.string().trim().min(1).max(10),
        qty: z.number().int().min(1).max(9),
      }),
    )
    .min(1)
    .max(30),
  city: z.string().trim().min(2).max(60),
  address: z.string().trim().min(10).max(300),
  phone: z.string().regex(/^\d{11}$/),
  postalCode: z.string().regex(/^\d{10}$/),
  couponCode: z.string().trim().max(20).optional(),
  idempotencyKey: z.string().uuid().optional(),
});

export type CartCheckoutValues = z.infer<typeof cartCheckoutSchema>;

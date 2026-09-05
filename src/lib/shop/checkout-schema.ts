import { z } from "zod";

// 🧾 Split from checkout-actions.ts: a "use server" module can only export async functions, not schema objects.
export const checkoutSchema = z.object({
  productId: z.number().int(),
  size: z.string().trim().min(1).max(10),
  qty: z.number().int().min(1).max(9),
  city: z.string().trim().min(2).max(60),
  address: z.string().trim().min(10).max(300),
  phone: z.string().regex(/^\d{11}$/),
  postalCode: z.string().regex(/^\d{10}$/),
  couponCode: z.string().trim().max(20).optional(),
  // 🔁 One key per checkout attempt — lets the server collapse a double-submit into the existing order.
  idempotencyKey: z.string().uuid().optional(),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;

// 🛒 Whole-cart counterpart to checkoutSchema — same fields, items widened to one order per cart.
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

import { z } from "zod";

const itemSchema = z.object({
  productId: z.number().int(),
  size: z.string().trim().min(1).max(10),
  qty: z.number().int().min(1).max(9),
});

const deliveryFields = {
  city: z.string().trim().min(2).max(60),
  address: z.string().trim().min(10).max(300),
  phone: z.string().regex(/^\d{11}$/),
  postalCode: z.string().regex(/^\d{10}$/),
  couponCode: z.string().trim().max(20).optional(),
  idempotencyKey: z.string().uuid().optional(),
};

export const checkoutSchema = z.object({ ...itemSchema.shape, ...deliveryFields });
export const cartCheckoutSchema = z.object({
  items: z.array(itemSchema).min(1).max(30),
  ...deliveryFields,
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;
export type CartCheckoutValues = z.infer<typeof cartCheckoutSchema>;

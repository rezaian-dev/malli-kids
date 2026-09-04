import type { User } from "@/types";

type ShippingFields = Pick<User, "phone" | "address" | "postalCode">;

// 📦 The fields an order can't actually be shipped without — used both to
// nudge someone toward finishing their profile *before* checkout (the
// account form) and to gently interrupt them right at the "ثبت سفارش" click
// if they skipped that (`product-buy-panel.tsx`). Checkout's own dialog
// still lets them fill these in inline as a fallback — this is a nudge, not
// a hard gate, since a first-time buyer shouldn't have to visit a separate
// page before they're allowed to complete an order.
const REQUIRED_SHIPPING_FIELDS: { key: keyof ShippingFields; label: string }[] = [
  { key: "phone", label: "شماره موبایل" },
  { key: "address", label: "آدرس" },
  { key: "postalCode", label: "کد پستی" },
];

/** Labels (Farsi) of whichever required shipping fields `user` is still
 *  missing, in a stable order — empty when the profile is shipping-ready. */
export function getMissingShippingFields(user: ShippingFields): string[] {
  return REQUIRED_SHIPPING_FIELDS.filter(({ key }) => !user[key]?.trim()).map(
    ({ label }) => label,
  );
}

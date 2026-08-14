import type { User } from "@/types";

type ShippingFields = Pick<User, "phone" | "address" | "postalCode">;

// 📦 The fields an order can't actually be shipped without — a hard gate,
// checked in two places: client-side at the "ثبت سفارش" click, before the
// checkout dialog is even allowed to open (`product-buy-panel.tsx`), and
// again server-side in `createOrderAction` so it can't be bypassed. A buyer
// missing any of these is sent to `/profile` to complete it first.
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

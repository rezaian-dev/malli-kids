import type { User } from "@/types";

type ShippingFields = Pick<User, "phone" | "address" | "postalCode">;

// Checked client-side before checkout opens, and again server-side so it can't be bypassed.
const REQUIRED_SHIPPING_FIELDS: { key: keyof ShippingFields; label: string }[] = [
  { key: "phone", label: "شماره موبایل" },
  { key: "address", label: "آدرس" },
  { key: "postalCode", label: "کد پستی" },
];

// Farsi labels of missing required fields, in a stable order; empty when shipping-ready.
export function getMissingShippingFields(user: ShippingFields): string[] {
  return REQUIRED_SHIPPING_FIELDS.filter(({ key }) => !user[key]?.trim()).map(
    ({ label }) => label,
  );
}

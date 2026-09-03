import { TextField } from "@/components/form";

// ♿ The city/address/phone/postal quartet `CheckoutDialog` (single item)
// and `CartCheckoutDialog` (whole cart) both render inside the
// `useCheckoutDeliveryForm` `<AppForm>` — plain `<TextField>`s reading that
// shared react-hook-form context, same label/inline-error chrome every other
// form in the app already gets from `<Field>` for free.
export function DeliveryFields() {
  return (
    <>
      <TextField
        name="phone"
        label="موبایل"
        type="tel"
        dir="ltr"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="0912…"
        inputClassName="text-right"
        required
      />

      <TextField
        name="city"
        label="شهر"
        autoComplete="address-level2"
        placeholder="مثل تهران"
        required
      />

      <TextField
        name="address"
        label="آدرس کامل"
        autoComplete="street-address"
        placeholder="خیابان، کوچه، پلاک، واحد"
        required
      />

      <TextField
        name="postal"
        label="کد پستی"
        dir="ltr"
        inputMode="numeric"
        autoComplete="postal-code"
        maxLength={10}
        placeholder="۱۰ رقم"
        inputClassName="text-right"
        required
      />
    </>
  );
}

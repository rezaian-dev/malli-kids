import { TextField } from "@/components/form";

// ♿ The delivery quartet shared by both checkout dialogs, reading the same
// useCheckoutDeliveryForm context
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

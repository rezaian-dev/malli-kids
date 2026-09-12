import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DeliveryErrors } from "@/hooks/use-checkout-delivery-form";

// ♿ The city/address/phone/postal quartet `CheckoutDialog` (single item)
// and `CartCheckoutDialog` (whole cart) both render around
// `useCheckoutDeliveryForm` — this is that render, in one place, so a real
// visible <label> + inline field error only had to be built (and fixed)
// once. Previously each dialog hand-rolled these as bare <Input>s with only
// a placeholder + aria-label — readable to a screen reader, but a sighted
// user had no visible label once they started typing (the placeholder
// disappears), and an invalid field surfaced only as a generic toast
// instead of a message next to the field itself.
function Row({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label
        htmlFor={id}
        className="text-navy/80 dark:text-linen text-xs font-bold"
      >
        {label}
      </Label>
      {children}
      {error ? (
        <p
          id={`${id}-err`}
          role="alert"
          className="text-rose flex items-start gap-1 text-[11px] font-bold leading-5"
        >
          <CircleAlert className="mt-0.5 size-3 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

export function DeliveryFields({
  phone,
  setPhone,
  city,
  setCity,
  address,
  setAddress,
  postal,
  setPostal,
  errors,
}: {
  phone: string;
  setPhone: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  postal: string;
  setPostal: (v: string) => void;
  errors: DeliveryErrors;
}) {
  return (
    <>
      <Row id="checkout-phone" label="موبایل" error={errors.phone}>
        <Input
          id="checkout-phone"
          dir="ltr"
          name="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0912…"
          inputMode="tel"
          autoComplete="tel-national"
          required
          aria-required="true"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "checkout-phone-err" : undefined}
          className="h-11 rounded-xl text-right"
        />
      </Row>

      <Row id="checkout-city" label="شهر" error={errors.city}>
        <Input
          id="checkout-city"
          name="address-level2"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="مثل تهران"
          autoComplete="address-level2"
          required
          aria-required="true"
          aria-invalid={Boolean(errors.city)}
          aria-describedby={errors.city ? "checkout-city-err" : undefined}
          className="h-11 rounded-xl"
        />
      </Row>

      <Row id="checkout-address" label="آدرس کامل" error={errors.address}>
        <Input
          id="checkout-address"
          name="street-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="خیابان، کوچه، پلاک، واحد"
          autoComplete="street-address"
          required
          aria-required="true"
          aria-invalid={Boolean(errors.address)}
          aria-describedby={
            errors.address ? "checkout-address-err" : undefined
          }
          className="h-11 rounded-xl"
        />
      </Row>

      <Row id="checkout-postal" label="کد پستی" error={errors.postal}>
        <Input
          id="checkout-postal"
          dir="ltr"
          name="postal-code"
          value={postal}
          onChange={(e) => setPostal(e.target.value)}
          placeholder="۱۰ رقم"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={10}
          required
          aria-required="true"
          aria-invalid={Boolean(errors.postal)}
          aria-describedby={errors.postal ? "checkout-postal-err" : undefined}
          className="h-11 rounded-xl text-right"
        />
      </Row>
    </>
  );
}

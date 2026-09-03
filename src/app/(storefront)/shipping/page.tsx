import { buildMetadata } from "@/lib/seo";
import { ShippingLanding } from "@/features/shipping/components/shipping-landing";

export const metadata = buildMetadata({
  title: "ارسال و بازگشت",
  description: "ارسال ۲ تا ۴ روزه، بازگشت ۷ روزه و ضمانت پارچه.",
  path: "/shipping",
});

export default function ShippingPage() {
  return <ShippingLanding />;
}

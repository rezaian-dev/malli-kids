import { buildMetadata } from "@/lib/seo";
import { TermsLanding } from "@/features/terms/components/terms-landing";

export const metadata = buildMetadata({
  title: "قوانین و مقررات",
  description: "شرایط خرید، قیمت و استفاده از فروشگاه.",
  path: "/terms",
});

export default function TermsPage() {
  return <TermsLanding />;
}

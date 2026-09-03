import { buildMetadata } from "@/lib/seo";
import { PrivacyLanding } from "@/features/privacy/components/privacy-landing";

export const metadata = buildMetadata({
  title: "حریم خصوصی",
  description: "چگونه داده‌های سفارش و حساب شما نگهداری می‌شود.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return <PrivacyLanding />;
}

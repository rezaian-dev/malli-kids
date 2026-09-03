import { buildMetadata } from "@/lib/seo";
import { FaqLanding } from "@/features/faq/components/faq-landing";

export const metadata = buildMetadata({
  title: "سوال‌های پرتکرار",
  description: "سایز، ارسال، بازگشت و پشتیبانی ملی‌کیدز.",
  path: "/faq",
});

export default function FaqPage() {
  return <FaqLanding />;
}

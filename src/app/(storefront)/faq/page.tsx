import { buildMetadata } from "@/lib/seo";
import { FaqLanding } from "./_components/faq-landing";

export const metadata = buildMetadata({
  title: "سوال‌های پرتکرار",
  description: "سایز، ارسال، بازگشت و پشتیبانی ملی‌کیدز.",
  path: "/faq",
});

export default function FaqPage() {
  return <FaqLanding />;
}

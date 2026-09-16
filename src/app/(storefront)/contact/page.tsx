import { buildMetadata } from "@/lib/seo";
import { ContactLanding } from "./_components/contact-landing";

export const metadata = buildMetadata({
  title: "تماس با ما",
  description: "آدرس گالری، تلفن و پشتیبانی سفارش‌ها.",
  path: "/contact",
});

export default function ContactPage() {
  return <ContactLanding />;
}

import { buildMetadata } from "@/lib/seo";
import { ComingSoon } from "./_components/try-on-coming-soon";

export const dynamic = "force-static";

// Pure coming-soon teaser. No studio, API, or client JS.
export const metadata = buildMetadata({
  title: "پرو مجازی (به‌زودی)",
  description:
    "اتاق پرو مجازی ملی‌کیدز به‌زودی باز می‌شود: پرو لباس کودک با هوش مصنوعی و پیشنهاد سایز.",
  path: "/tryon",
});

export default function TryOnPage() {
  return <ComingSoon />;
}

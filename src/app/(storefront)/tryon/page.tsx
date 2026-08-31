import { Intro } from "@/components/shared/intro";
import { buildMetadata } from "@/lib/seo";
import { TryOnComingSoon } from "./_components/try-on-coming-soon";

export const metadata = buildMetadata({
  title: "پرو مجازی",
  description: "اتاق پرو دیجیتال ملی کیدز برای پیش‌نمایش لباس و پیدا کردن سایز مناسب کودک.",
  path: "/tryon",
  keywords: ["پرو مجازی کودک", "اتاق پرو دیجیتال", "سایز لباس کودک با هوش مصنوعی"],
  noIndex: true,
});

// 🚀 Swap the coming-soon view with the live studio when the provider is ready.
export default function TryOnPage() {
  return (
    <>
      <Intro
        crumb="پرو مجازی"
        kicker="VIRTUAL FITTING ROOM"
        title="اتاق پرو دیجیتال ملی‌کیدز"
        lead="لباس‌های کالکشن را روی تن کوچولو ببینید و سایز مناسب را پیدا کنید — این تجربه به‌زودی ارائه می‌شود."
      />
      <TryOnComingSoon />
    </>
  );
}

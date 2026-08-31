import type { Metadata } from "next";
import { Intro } from "@/components/shared/intro";
import { TryOnComingSoon } from "./_components/try-on-coming-soon";

export const metadata: Metadata = {
  title: "پرو مجازی",
  description: "اتاق پرو دیجیتال مالی کیدز؛ لباس‌های کالکشن را روی تنِ کوچولو ببینید.",
};

// 🚀 Swap the coming-soon view with the live studio when the provider is ready.
export default function TryOnPage() {
  return (
    <>
      <Intro
        crumb="پرو مجازی"
        kicker="VIRTUAL FITTING ROOM"
        title="اتاق پرو دیجیتال ملی‌کیدز"
        lead="لباس‌های کالکشن را روی تنِ کوچولو ببینید و سایز مناسب را پیدا کنید — این تجربه به‌زودی ارائه می‌شود."
      />
      <TryOnComingSoon />
    </>
  );
}

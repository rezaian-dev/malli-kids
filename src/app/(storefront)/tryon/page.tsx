import type { Metadata } from "next";
import { Intro } from "@/components/shared/intro";
import { TryOnComingSoon } from "./coming-soon";

export const metadata: Metadata = {
  title: "پرو مجازی",
  description: "اتاق پرو دیجیتال مالی کیدز؛ لباس‌های کالکشن را روی تنِ کوچولو ببینید.",
};


// The live AI studio lives in ./studio (<Studio />) and its API in app/api/tryon/route.ts.
// When the AI provider is ready, swap <TryOnComingSoon /> for <Studio /> to re-enable it.
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

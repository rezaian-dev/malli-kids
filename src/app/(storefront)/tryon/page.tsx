import { Intro } from "@/components/shared/intro";
import { buildMetadata } from "@/lib/seo";
import { Studio } from "./_components/try-on-studio";

export const metadata = buildMetadata({
  title: "پرو مجازی",
  description: "اتاق پرو دیجیتال برای دیدن لباس و پیدا کردن سایز.",
  path: "/tryon",
});

export default function TryOnPage() {
  return (
    <>
      <Intro
        crumb="پرو مجازی"
        kicker="VIRTUAL FITTING ROOM"
        title="اتاق پرو دیجیتال ملی‌کیدز"
        lead="یک عکس تمام‌قد بگذارید، لباس کالکشن را انتخاب کنید و سایز پیشنهادی را ببینید."
        path="/tryon"
      />
      <Studio />
    </>
  );
}

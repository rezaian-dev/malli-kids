import nextDynamic from "next/dynamic";
import { Intro } from "@/components/shared/intro";
import { buildMetadata } from "@/lib/seo";
import { ComingSoon } from "./_components/try-on-coming-soon";

export const dynamic = "force-static";

// 🚩 Until TRYON_LIVE=true, /tryon renders a chic coming-soon page. The
// real studio (client JS) is dynamically imported so its bundle never
// ships on the coming-soon page. Read at build time (force-static) —
// restart/rebuild after flipping the flag.
const LIVE = process.env.TRYON_LIVE === "true";

const Studio = nextDynamic(() =>
  import("./_components/try-on-studio").then((m) => m.Studio),
);

export const metadata = buildMetadata({
  title: LIVE ? "پرو مجازی" : "پرو مجازی (به‌زودی)",
  description: LIVE
    ? "اتاق پرو دیجیتال برای دیدن لباس و پیدا کردن سایز."
    : "اتاق پرو مجازی ملی‌کیدز به‌زودی باز می‌شود: پرو لباس کودک با هوش مصنوعی و پیشنهاد سایز.",
  path: "/tryon",
});

export default function TryOnPage() {
  if (!LIVE) return <ComingSoon />;
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

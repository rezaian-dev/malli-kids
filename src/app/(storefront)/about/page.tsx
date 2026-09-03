import { AboutLanding } from "./_components/about-landing";
import { Intro } from "@/components/shared/intro";
import { ABOUT } from "@/lib/data/pages";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "درباره ما",
  description: "آتلیه پوشاک کودک با دوخت ایرانی و پارچه‌های امن.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <Intro
        crumb={ABOUT.crumb}
        kicker={ABOUT.kicker}
        title={ABOUT.title}
        lead={ABOUT.lead}
        path="/about"
        schemaType="AboutPage"
      />
      <AboutLanding />
    </>
  );
}

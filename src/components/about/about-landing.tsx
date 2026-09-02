import {
  ClosingQuote,
  ContactBanner,
  CtaLinks,
  Studio,
} from "@/components/about/sections";

export function AboutLanding() {
  return (
    <>
      <CtaLinks />
      <Studio />
      <ClosingQuote />
      <ContactBanner />
    </>
  );
}

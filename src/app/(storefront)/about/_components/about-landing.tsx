import { ClosingQuote } from "./sections/closing-quote";
import { ContactBanner } from "./sections/contact-banner";
import { CtaLinks } from "./sections/cta-links";
import { Studio } from "./sections/studio";

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

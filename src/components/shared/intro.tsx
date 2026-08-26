import { Breadcrumb } from "@/components/shared/breadcrumb";
import { JsonLd } from "@/components/shared/json-ld";
import { Stagger, StaggerItem } from "@/components/motion/static";
import { pageSchema } from "@/lib/seo";
import { cn } from "@/lib/utils";

type IntroProps = {
  crumb: string;
  kicker?: string;
  title: string;
  lead?: string;
  path?: string;
  schemaType?:
    "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" | "FAQPage";
  schemaDescription?: string;
};

export function Intro({
  crumb,
  kicker,
  title,
  lead,
  path,
  schemaType = "WebPage",
  schemaDescription,
}: IntroProps) {
  return (
    <>
      {path ? (
        <JsonLd
          data={pageSchema({
            title,
            description: schemaDescription ?? lead,
            path,
            type: schemaType,
          })}
        />
      ) : null}
      <header className="relative mb-10 sm:mb-14">
        <div className="xs:px-4 container mx-auto w-full max-w-5xl px-3 sm:px-5 lg:px-7">
          <Stagger
            className={cn(
              "overflow-hidden rounded-[28px] border px-5 py-7 sm:px-8 sm:py-9",
              "border-gold/30 bg-white/90 shadow-[0_18px_40px_-28px_rgba(14,42,71,.28)]",
              "dark:border-gold/35 dark:bg-slate/50",
            )}
          >
            <StaggerItem>
              <Breadcrumb
                items={[
                  { name: "خانه", path: "/" },
                  { name: crumb, path },
                ]}
                className="mb-0"
              />
            </StaggerItem>
            {kicker ? (
              // ♿ brown-mid, not gold: this kicker sits on the same
              // white/cream card as the header logo fix, so it fails
              // contrast the same way (~2.2:1 vs the 4.5:1 minimum).
              // `Intro` is the shared page-header for most storefront
              // pages, so this one line covers all of them at once.
              <StaggerItem>
                <p className="text-brown-mid dark:text-gold mt-5 text-[11px] font-black tracking-[0.22em]">
                  {kicker}
                </p>
              </StaggerItem>
            ) : null}
            <StaggerItem>
              <h1
                className={cn(
                  "mt-2 text-[clamp(1.6rem,4.5vw,2.6rem)] leading-snug font-black",
                  "text-navy",
                  "dark:text-ivory",
                )}
              >
                {title}
              </h1>
            </StaggerItem>
            <StaggerItem>
              <span
                className="from-gold mt-4 block h-px w-16 bg-linear-to-l to-transparent"
                aria-hidden
              />
            </StaggerItem>
            {lead ? (
              <StaggerItem>
                <p
                  className={cn(
                    "mt-4 max-w-2xl text-sm leading-8 sm:text-base",
                    "text-navy/70",
                    "dark:text-wheat",
                  )}
                >
                  {lead}
                </p>
              </StaggerItem>
            ) : null}
          </Stagger>
        </div>
      </header>
    </>
  );
}

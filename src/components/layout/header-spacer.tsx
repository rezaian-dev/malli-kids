/**
 * The storefront main already owns the responsive header offset with Tailwind:
 * `pt-[7.25rem] sm:pt-32`. The header/banner deliberately keeps a stable
 * height, so no runtime style mutation or resize observer is needed here.
 */
export function HeaderSpacer() {
  return null;
}

// 📐 Static offset for the fixed header: banner (h-12 / sm:h-13) + bar (h-14 /
// sm:h-16) + 28px gap. No JS — height never jumps after hydration.
export function HeaderSpacer() {
  return <div aria-hidden className="h-[8.25rem] sm:h-36" />;
}

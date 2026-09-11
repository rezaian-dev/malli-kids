// 📐 Static offset for the fixed header: banner (h-14 / sm:h-15) + bar (h-14 /
// sm:h-16) + 28px gap. No JS — height never jumps after hydration.
export function HeaderSpacer() {
  return <div aria-hidden className="h-35 sm:h-38" />;
}

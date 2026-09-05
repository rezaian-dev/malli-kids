// 🔗 Shared across the header/profile route boundary — see the colocation rule in AGENTS.md.
// 🩹 Next's <Link> pushState hash nav never fires a native hashchange event, so a same-page
// hash click wouldn't switch tabs without this custom event.
export type ProfileTab = "info" | "orders" | "wishlist" | "support";

export const PROFILE_TAB_EVENT = "profile:tab";

export function profileTabHref(tab: ProfileTab): string {
  return tab === "info" ? "/profile" : `/profile#${tab}`;
}

// 📣 Call from the header menu alongside its normal <Link> navigation.
export function announceProfileTab(tab: ProfileTab) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ProfileTab>(PROFILE_TAB_EVENT, { detail: tab }));
}

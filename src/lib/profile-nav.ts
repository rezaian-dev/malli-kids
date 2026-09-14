// Dispatch hashchange after Link's pushState navigation.
export type ProfileTab = "info" | "orders" | "wallet" | "wishlist" | "support";

export const PROFILE_TAB_EVENT = "profile:tab";

export function profileTabHref(tab: ProfileTab): string {
  return tab === "info" ? "/profile" : `/profile#${tab}`;
}

// Call from the header menu alongside its normal <Link> navigation.
export function announceProfileTab(tab: ProfileTab) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ProfileTab>(PROFILE_TAB_EVENT, { detail: tab }));
}

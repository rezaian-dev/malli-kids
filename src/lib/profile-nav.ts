// 🔗 Shared between the header's account dropdown (`components/layout/`,
// outside `src/app/**`) and the `/profile` route's tab state
// (`app/(storefront)/profile/_components/`) — see the colocation rule in
// AGENTS.md history: anything crossing that boundary is promoted here
// instead of one side reaching into the other's private `_components/`.
//
// Why this exists at all: `/profile#orders` etc. are plain hash links, and
// the App Router's `<Link>` updates same-page hash navigations through
// `history.pushState` under the hood — which, unlike a real user-driven hash
// change, never dispatches a native `hashchange` event (a long-standing
// browser quirk, not a Next.js bug). So a click on "پیگیری سفارشات" while
// already on `/profile` silently updates the URL bar and nothing else —
// `ProfileView`'s `hashchange` listener never fires and the visible tab
// never switches. Firing this custom event alongside the `<Link>` click
// gives `ProfileView` the exact target tab directly (no re-reading
// `location.hash`, which would still be racing the router's own async URL
// update) so the switch is instant and correct whether or not the browser
// event ever fires.
export type ProfileTab = "info" | "orders" | "wishlist" | "support";

export const PROFILE_TAB_EVENT = "profile:tab";

export function profileTabHref(tab: ProfileTab): string {
  return tab === "info" ? "/profile" : `/profile#${tab}`;
}

/** 📣 Tell any mounted `ProfileView` to switch to `tab` right now — call this
 *  from the header menu alongside its normal `<Link>` navigation. */
export function announceProfileTab(tab: ProfileTab) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ProfileTab>(PROFILE_TAB_EVENT, { detail: tab }));
}

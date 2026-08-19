/** 📡 The admin console's "something changed" broadcast. Every admin
 *  landing calls `notifyAdminMutation()` after one of its own mutations
 *  succeeds; `AdminShell` listens and re-reads the header/sidebar counts
 *  immediately — so closing a chat updates the sidebar badge in the same
 *  breath, instead of waiting for the next poll tick. Cross-page on
 *  purpose: an action on `/admin/orders` can move counts shown on every
 *  page, and the shell outlives page navigation. Client-only (it's just a
 *  `window` event); server components never import this. */
export const ADMIN_MUTATED_EVENT = "mk:admin-mutated";

export function notifyAdminMutation() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ADMIN_MUTATED_EVENT));
}

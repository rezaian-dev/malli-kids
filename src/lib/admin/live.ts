// 📡 Client-only event: mutations broadcast so AdminShell refreshes header/sidebar counts instantly.
export const ADMIN_MUTATED_EVENT = "mk:admin-mutated";

export function notifyAdminMutation() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ADMIN_MUTATED_EVENT));
}

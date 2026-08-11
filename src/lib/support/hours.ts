/** 🕘 Client-safe support-hours check — Tehran-local hour against the
 *  store's configured window (see `/admin/settings`). Wrap-around windows
 *  (e.g. 20 → 2) count as overnight shifts. Pure + tiny so both the chat
 *  window and any future surface can share it. */
export function isWithinSupportHours(
  now: Date,
  startHour: number,
  endHour: number,
): boolean {
  const hour = Number(
    new Intl.DateTimeFormat("en", {
      timeZone: "Asia/Tehran",
      hour: "numeric",
      hour12: false,
    }).format(now),
  );
  if (Number.isNaN(hour)) return true;
  return startHour <= endHour
    ? hour >= startHour && hour < endHour
    : hour >= startHour || hour < endHour;
}

// Interpret support hours in Tehran, including overnight windows.
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

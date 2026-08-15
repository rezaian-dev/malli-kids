// 👤 Person-name helpers — kept separate from locale/number formatting
// (see `@/lib/locale/fa`) since names aren't a locale-formatting concern.

/**
 * 🙋 The first word of a name, defaulting to a friendly fallback when empty.
 */
export function givenName(name: string | null | undefined): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "کاربر";
  return trimmed.split(/\s+/)[0];
}

/**
 * 🪪 Join first + last name; falls back to just the given name when the
 * last name is missing, and to the friendly default when both are.
 */
export function fullName(
  first?: string | null,
  last?: string | null,
): string {
  return (
    [first, last]
      .filter((part) => (part ?? "").trim())
      .join(" ")
      .trim() || givenName(first)
  );
}

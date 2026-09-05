// 👤 Person-name helpers, kept separate from locale/number formatting.

// 🙋 First word of a name; falls back to a friendly default when empty.
export function givenName(name: string | null | undefined): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "کاربر";
  return trimmed.split(/\s+/)[0];
}

// 🪪 Falls back to just the given name, then to the friendly default, as parts go missing.
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

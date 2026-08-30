import "server-only";

// 🪶 The one moving part shared by every "generate a unique slug" admin
// action (products, articles): keep incrementing a numeric suffix while a
// candidate slug already exists. The slugify rules themselves (which
// characters survive, how the suffix is formatted) are domain-specific and
// stay in each caller — only this loop was truly identical.
export async function uniqueSlugAgainst(
  model: { exists(filter: { slug: string }): Promise<unknown> },
  base: string,
  formatSuffix: (n: number) => string | number = (n) => n,
): Promise<string> {
  let slug = base;
  let i = 2;
  while (await model.exists({ slug })) {
    slug = `${base}-${formatSuffix(i++)}`;
  }
  return slug;
}

import "server-only";

// Shared by every "generate a unique slug" action; slugify rules stay in each caller.
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

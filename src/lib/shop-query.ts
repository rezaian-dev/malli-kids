import { CATS } from "@/lib/constants";
import { SEASONS } from "@/lib/data/products";

// 🎯 If the whole query is a category/season, keep it as a filter — not `query=`.

const TYPE_CATS = new Set(["سیسمونی", "لباس مشاغل", "اکسسوری", "دستدوز"]);

const CAT_ALIASES: Record<string, string> = {
  "دستدوز خاص": "دستدوز",
};

export function normalizeShopText(value: string) {
  return value
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchShopCategory(value: string) {
  const normalized = normalizeShopText(value);
  if (!normalized) return;
  if (normalized in CAT_ALIASES) return CAT_ALIASES[normalized];
  if ((CATS as readonly string[]).includes(normalized)) return normalized;
}

export function resolveShopSearchIntent(raw: string): {
  cat?: string;
  season?: string;
  q: string;
} {
  const trimmed = raw.trim();
  const q = normalizeShopText(trimmed);
  if (!q) return { q: "" };

  const exactCat = matchShopCategory(q);
  if (exactCat) return { cat: exactCat, q: "" };

  if ((SEASONS as readonly string[]).includes(q)) return { season: q, q: "" };

  const tokens = q.split(" ");
  if (tokens.length > 1) {
    const cats = tokens.map(matchShopCategory);
    const seasons = tokens.map((token) =>
      (SEASONS as readonly string[]).includes(token) ? token : undefined,
    );

    if (tokens.every((_, index) => cats[index] || seasons[index])) {
      const typeCat = cats.find(
        (cat): cat is string => !!cat && TYPE_CATS.has(cat),
      );
      const firstCat = cats.find((cat): cat is string => Boolean(cat));
      const firstSeason = seasons.find((season): season is string =>
        Boolean(season),
      );
      return { cat: typeCat ?? firstCat, season: firstSeason, q: "" };
    }
  }

  return { q: trimmed.slice(0, 60) };
}

export function applyShopSearchIntent<
  T extends { cat: string; season: string; q: string },
>(state: T): T {
  const intent = resolveShopSearchIntent(state.q);
  return {
    ...state,
    cat: intent.cat ?? state.cat,
    season: intent.season ?? state.season,
    q: intent.q,
  };
}

export function shopHrefFromSearch(raw: string) {
  const intent = resolveShopSearchIntent(raw);
  const params = new URLSearchParams();

  if (intent.cat && intent.cat !== "همه") params.set("category", intent.cat);
  if (intent.season) params.set("season", intent.season);
  if (intent.q) params.set("query", intent.q);

  const query = params.toString();
  return query ? `/shop?${query}` : "/shop";
}

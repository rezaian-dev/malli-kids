import { CATS } from "@/lib/constants";
import { SEASONS } from "@/lib/data/products";

// 🎯 If a search is (or contains) a category/season, keep it as a filter —
// never as a `query=` parameter. Faceted URLs are clean, canonical and
// indexable; free-text `query=` results are thin and get `noindex`.

const TYPE_CATS = new Set(["سیسمونی", "لباس مشاغل", "اکسسوری", "دستدوز"]);

const CAT_ALIASES: Record<string, string> = {
  "دستدوز خاص": "دستدوز",
};

// 🧠 Product-style keywords. These are NOT categories by themselves, so a
// lone "پالتو" stays a real search. But in a compound intent like
// "پالتو دخترانه" they let us drop the keyword and keep the clean facet
// (category=دخترانه). Explicit category tokens always win.
const KEYWORD_CATS: Record<string, string> = {
  پالتو: "دخترانه",
  پیراهن: "دخترانه",
  شومیز: "دخترانه",
  بلوز: "دخترانه",
  مجلسی: "دخترانه",
  دامن: "دخترانه",
  سرهمی: "سیسمونی",
  ست: "سیسمونی",
  تیشرت: "پسرانه",
  شلوار: "پسرانه",
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

function matchKeywordCategory(value: string) {
  const normalized = normalizeShopText(value);
  if (!normalized) return;
  return KEYWORD_CATS[normalized];
}

export function resolveShopSearchIntent(raw: string): {
  cat?: string;
  season?: string;
  q: string;
} {
  const trimmed = raw.trim();
  const q = normalizeShopText(trimmed);
  if (!q) return { q: "" };

  // Exact category name (or alias) → pure category filter.
  const exactCat = matchShopCategory(q);
  if (exactCat) return { cat: exactCat, q: "" };

  // Exact season → pure season filter.
  if ((SEASONS as readonly string[]).includes(q)) return { season: q, q: "" };

  // Compound intent: tokens may mix a category, a season and/or a product
  // keyword. An explicit category token wins → clean facet URL.
  const tokens = q.split(" ");
  if (tokens.length > 1) {
    const cats = tokens.map(matchShopCategory);
    const seasons = tokens.map((token) =>
      (SEASONS as readonly string[]).includes(token) ? token : undefined,
    );
    const keywords = tokens.map(matchKeywordCategory);

    const explicitCat = cats.find((cat): cat is string => Boolean(cat));
    const typeCat = cats.find(
      (cat): cat is string => !!cat && TYPE_CATS.has(cat),
    );
    const firstSeason = seasons.find((season): season is string => Boolean(season));
    const isUnresolvedToken = (index: number) =>
      !cats[index] && !seasons[index] && !keywords[index];

    // Every token maps to a known facet/synonym — treat the whole phrase as a
    // filtered collection, not a free-text search.
    if (tokens.every((_, index) => !isUnresolvedToken(index))) {
      const hasCategoryToken = cats.some(Boolean) || keywords.some(Boolean);

      if (hasCategoryToken) {
        const cat = explicitCat ?? typeCat;
        return {
          cat: cat ?? keywords.find(Boolean),
          season: firstSeason,
          q: "",
        };
      }

      // Only seasons + synonyms (e.g. "پالتو زمستانه"): keep the keyword as
      // the search text but lift the season into a facet.
      const rest = tokens.filter((_, index) => keywords[index]);
      return { season: firstSeason, q: rest.join(" ") };
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

// 🏷️ Direct category URL (used by the home quick-search chips).
export function shopCategoryHref(cat: string) {
  const params = new URLSearchParams();
  if (cat && cat !== "همه") params.set("category", cat);
  const query = params.toString();
  return query ? `/shop?${query}` : "/shop";
}

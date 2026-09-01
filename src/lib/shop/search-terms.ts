import { unstable_cache } from "next/cache";
import { REVALIDATE } from "@/lib/cache";
import { connectMongoose } from "@/lib/db/mongoose";
import { SearchTermModel } from "@/lib/db/models/search-term";

// 🔥 The real "پرطرفدار" (popular searches) engine — replaces a hand-picked
// static chip list with actual search counts, same "cheap counter, cached
// read" shape as product `sold` counts.

export const SEARCH_TERMS_TAG = "search-terms";
const MIN_TERM_LEN = 2;
const MAX_TERM_LEN = 60;
const DEFAULT_LIMIT = 4;

// 🌱 Cold-start seed — only ever shown to pad out the list before real
// searches exist. Any organic term outranks these the moment it gets a
// single real search, since they're appended after (never counted as) the
// real, sorted-by-count results below.
const FALLBACK_TERMS = ["پیراهن", "سیسمونی", "پالتو", "دستدوز"];

function normalizeTerm(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, MAX_TERM_LEN);
}

/** 📈 Fire-and-forget counter bump for one real, submitted search — same
 *  "never fail the real action" shape as `notifyBackInStock`. Too-short
 *  queries (a stray letter) are dropped so they can't pollute the ranking. */
export async function recordSearchTerm(raw: string): Promise<void> {
  const term = normalizeTerm(raw);
  if (term.length < MIN_TERM_LEN) return;

  try {
    await connectMongoose();
    await SearchTermModel.updateOne(
      { term },
      { $inc: { count: 1 } },
      { upsert: true },
    );
  } catch {
    // 🤐 A miscounted search must never surface as a broken search box.
  }
}

/** 🏆 Top real search terms, most-searched first — refreshed every few
 *  minutes (`REVALIDATE.merch`) rather than on every write, so one burst of
 *  searches doesn't need a live tag revalidation to show up. Padded with
 *  `FALLBACK_TERMS` when real data hasn't filled the list yet (a brand-new
 *  site, or just after launch). */
export const getTopSearchTerms = unstable_cache(
  async (limit: number = DEFAULT_LIMIT): Promise<string[]> => {
    await connectMongoose();
    const docs = await SearchTermModel.find({ count: { $gt: 0 } })
      .sort({ count: -1, updatedAt: -1 })
      .limit(limit)
      .select("term")
      .lean();
    const real = docs.map((d) => d.term);
    if (real.length >= limit) return real;

    const padding = FALLBACK_TERMS.filter((term) => !real.includes(term));
    return [...real, ...padding].slice(0, limit);
  },
  ["top-search-terms"],
  { tags: [SEARCH_TERMS_TAG], revalidate: REVALIDATE.merch },
);

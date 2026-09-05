import { unstable_cache } from "next/cache";
import { REVALIDATE } from "@/lib/cache";
import { connectMongoose } from "@/lib/db/mongoose";
import { SearchTermModel } from "@/lib/db/models/search-term";

// 🔥 Ranks "پرطرفدار" chips by actual search counts instead of a hand-picked static list.

export const SEARCH_TERMS_TAG = "search-terms";
const MIN_TERM_LEN = 2;
const MAX_TERM_LEN = 60;
const DEFAULT_LIMIT = 4;

// 🌱 Cold-start padding only — any real search outranks these immediately.
const FALLBACK_TERMS = ["پیراهن", "سیسمونی", "پالتو", "دستدوز"];

function normalizeTerm(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, MAX_TERM_LEN);
}

// 📈 Fire-and-forget, like notifyBackInStock; too-short queries are dropped so they can't pollute the ranking.
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

// 🏆 Refreshed every few minutes rather than on every write; padded with FALLBACK_TERMS until real data fills it.
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

"use server";

import { recordSearchTerm } from "@/lib/shop/search-terms";

// 📈 Called only on submitted searches — never keystrokes
export async function recordSearchAction(term: string): Promise<void> {
  await recordSearchTerm(term);
}

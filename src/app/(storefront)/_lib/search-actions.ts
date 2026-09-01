"use server";

import { recordSearchTerm } from "@/lib/shop/search-terms";

// 📈 Called from the home search box on every real, submitted search —
// never on each keystroke — so the "پرطرفدار" list reflects what people
// actually searched for, not what they typed while still deciding.
export async function recordSearchAction(term: string): Promise<void> {
  await recordSearchTerm(term);
}

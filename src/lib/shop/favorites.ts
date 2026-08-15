import { connectMongoose } from "@/lib/db/mongoose";
import { Profile } from "@/lib/db/models/profile";

export async function getFavoriteIds(userId: string): Promise<number[]> {
  await connectMongoose();
  const doc = await Profile.findOne({ userId }).lean();
  return doc?.favorites ?? [];
}

/** 💛 Adds/removes `id` from the signed-in user's real wishlist and returns
 *  the updated list — the account-backed replacement for the old
 *  `localStorage` toggle. */
export async function toggleFavorite(userId: string, id: number): Promise<number[]> {
  await connectMongoose();
  const current = await getFavoriteIds(userId);
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [id, ...current];

  await Profile.updateOne(
    { userId },
    { $set: { favorites: next } },
    { upsert: true },
  );
  return next;
}

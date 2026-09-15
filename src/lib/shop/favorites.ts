import { errorMessage } from "@/lib/action-result";
import { connectMongoose } from "@/lib/db/mongoose";
import { Profile } from "@/lib/db/models/profile";

export async function getFavoriteIds(userId: string): Promise<number[]> {
  try {
    await connectMongoose();
    const doc = await Profile.findOne({ userId }).lean();
    return doc?.favorites ?? [];
  } catch (err) {
    console.warn("[favorites] getFavoriteIds failed — returning empty:", errorMessage(err));
    return [];
  }
}

// Adds/removes id from the wishlist and returns the updated list.
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

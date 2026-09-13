import { getSession } from "@/lib/auth/session";
import { connectMongoose } from "@/lib/db/mongoose";
import { Profile } from "@/lib/db/models/profile";
import type { User } from "@/types";

// Shared helpers for the profile action files

export const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";
export const AUTH_ERROR = "برای این کار باید وارد حساب‌تان باشید.";

// Resolve profile ownership from the server session.
export async function requireUserId() {
  const session = await getSession();
  return session?.user.id ?? null;
}

export async function requireSessionUser() {
  const session = await getSession();
  if (!session?.user) return null;
  return { id: session.user.id, name: session.user.name };
}

export async function upsertProfile(userId: string, patch: Partial<User>) {
  await connectMongoose();
  await Profile.updateOne({ userId }, { $set: patch }, { upsert: true });
}

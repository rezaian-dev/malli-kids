import { cache } from "react";
import { connectMongoose } from "@/lib/db/mongoose";
import { Profile } from "@/lib/db/models/profile";
import type { User } from "@/types";

/** 👤 Splits Better Auth's single `name` field into the `firstName`/
 *  `lastName` shape the app displays. */
export function splitName(name: string) {
  const [firstName, ...rest] = name.trim().split(/\s+/);
  return { firstName: firstName || "کاربر", lastName: rest.join(" ") || undefined };
}

/** 🧩 Builds the complete `User` (identity + persisted `Profile` extras) for
 *  a Better Auth identity. Shared by `getSessionUser()` (from the session
 *  cookie) and the sign-in/sign-up actions (from their direct API response)
 *  so both paths — a fresh page load *and* logging in without one — return
 *  the exact same, complete shape.
 *
 *  🧊 `cache()`-wrapped: `getSessionUser()` and every `/admin/**` page's
 *  `requireAdmin()` call this with the *same* `session.user` object
 *  reference within one request (since `getSession()` in `./session` is
 *  itself cached), so this collapses back down to one `Profile.findOne()`
 *  Mongo query per request instead of one per call site. */
export const buildUser = cache(async (identity: {
  id: string;
  name: string;
  email: string;
}): Promise<User> => {
  await connectMongoose();
  const profile = await Profile.findOne({ userId: identity.id }).lean();

  return {
    ...splitName(identity.name),
    email: identity.email,
    phone: profile?.phone,
    avatar: profile?.avatar,
    postalCode: profile?.postalCode,
    city: profile?.city,
    address: profile?.address,
    lat: profile?.lat,
    lng: profile?.lng,
    childName: profile?.childName,
    childAge: profile?.childAge,
    childGender: profile?.childGender,
    childHeightCm: profile?.childHeightCm,
  };
});

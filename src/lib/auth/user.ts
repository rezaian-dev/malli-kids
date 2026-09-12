import { cache } from "react";
import { connectMongoose } from "@/lib/db/mongoose";
import { Profile } from "@/lib/db/models/profile";
import type { User } from "@/types";

// 👤 Splits Better Auth's single name field into firstName/lastName.
export function splitName(name: string) {
  const [firstName, ...rest] = name.trim().split(/\s+/);
  return {
    firstName: firstName || "کاربر",
    lastName: rest.join(" ") || undefined,
  };
}

// 🧩 Merges identity + persisted Profile into the app's User shape.
// 🧊 cache()-wrapped so repeat calls in one request share a single Profile query.
export const buildUser = cache(
  async (identity: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string | null;
    phoneNumberVerified?: boolean | null;
  }): Promise<User> => {
    await connectMongoose();
    const profile = await Profile.findOne({ userId: identity.id }).lean();

    return {
      ...splitName(identity.name),
      email: identity.email,
      phone: profile?.phone || identity.phoneNumber || undefined,
      recoveryPhone: identity.phoneNumberVerified
        ? identity.phoneNumber || undefined
        : undefined,
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
  },
);

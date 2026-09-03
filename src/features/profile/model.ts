import { Schema, model, models, type Model } from "mongoose";

// 🧸 Everything about a customer that isn't identity (name/email live on
// Better Auth's own `user` collection — see `@/lib/auth/session`).
export type ProfileDoc = {
  userId: string;
  phone?: string;
  avatar?: string;
  nationalId?: string;
  city?: string;
  address?: string;
  childName?: string;
  childAge?: string;
  childGender?: string;
};

const profileSchema = new Schema<ProfileDoc>(
  {
    userId: { type: String, required: true, unique: true },
    phone: String,
    avatar: String,
    nationalId: String,
    city: String,
    address: String,
    childName: String,
    childAge: String,
    childGender: String,
  },
  { timestamps: true },
);

// 🔁 `models.Profile` survives Next's dev-mode HMR; without this guard,
// re-importing this module would try (and fail) to redefine the model.
export const Profile: Model<ProfileDoc> =
  (models.Profile as Model<ProfileDoc>) || model<ProfileDoc>("Profile", profileSchema);

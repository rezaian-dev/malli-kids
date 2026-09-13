import "server-only";
import { Schema, model, models, type Model } from "mongoose";

// Keep profile details separate from Better Auth identity fields.
export type ProfileDoc = {
  userId: string;
  phone?: string;
  avatar?: string;
  postalCode?: string;
  city?: string;
  address?: string;
  // A text address remains valid without a map pin.
  lat?: number;
  lng?: number;
  childName?: string;
  childAge?: string;
  childGender?: string;
  childHeightCm?: string;
  favorites?: number[];
};

const profileSchema = new Schema<ProfileDoc>(
  {
    userId: { type: String, required: true, unique: true },
    phone: String,
    avatar: String,
    postalCode: String,
    city: String,
    address: String,
    lat: Number,
    lng: Number,
    childName: String,
    childAge: String,
    childGender: String,
    childHeightCm: String,
    favorites: { type: [Number], default: [] },
  },
  { timestamps: true },
);

export const Profile: Model<ProfileDoc> =
  (models.Profile as Model<ProfileDoc>) ||
  model<ProfileDoc>("Profile", profileSchema);

import "server-only";
import { Schema, model, models, type Model } from "mongoose";

// 🧸 Everything about a customer that isn't identity (name/email live on
// Better Auth's own `user` collection — see `@/lib/auth/session`).
export type ProfileDoc = {
  userId: string;
  phone?: string;
  avatar?: string;
  postalCode?: string;
  city?: string;
  address?: string;
  // 🗺️ Set together with `address` from the profile's Leaflet/OpenStreetMap map
  // picker (see `@/app/(storefront)/profile/_components/address-map-field`)
  // — optional, a plain-text address with no pin is still valid.
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

// 🔁 `models.Profile` survives Next's dev-mode HMR; without this guard,
// re-importing this module would try (and fail) to redefine the model.
export const Profile: Model<ProfileDoc> =
  (models.Profile as Model<ProfileDoc>) ||
  model<ProfileDoc>("Profile", profileSchema);

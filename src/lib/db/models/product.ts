import "server-only";
import { Schema, model, models, type Model } from "mongoose";
import type { Season } from "@/types";

// 🛍️ The real catalog collection behind every admin product/inventory screen
// and every storefront listing. `id` is a small public numeric id (not
// Mongo's own `_id`) — the whole app already treats product ids as numbers
// (cart, wishlist, `/product/[id]`), so this keeps that contract intact
// instead of rippling a string-id change through the storefront.
export type ProductDoc = {
  id: number;
  images: string[];
  name: string;
  cat: string;
  season?: Season;
  price: number;
  old?: number;
  disc?: string;
  badge?: string;
  rate: number;
  stock: boolean;
  sold: number;
  desc: string;
  updatedAt: Date;
};

const productSchema = new Schema<ProductDoc>(
  {
    id: { type: Number, required: true, unique: true },
    images: {
      type: [String],
      required: true,
      validate: (value: string[]) => value.length >= 1,
    },
    name: { type: String, required: true },
    cat: { type: String, required: true },
    season: String,
    price: { type: Number, required: true },
    old: Number,
    disc: String,
    badge: String,
    rate: { type: Number, default: 4.8 },
    stock: { type: Boolean, default: true },
    sold: { type: Number, default: 0 },
    desc: { type: String, required: true },
  },
  { timestamps: true },
);

export const ProductModel: Model<ProductDoc> =
  (models.Product as Model<ProductDoc>) ||
  model<ProductDoc>("Product", productSchema);

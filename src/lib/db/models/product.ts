import "server-only";
import { Schema, model, models, type Model } from "mongoose";
import type { Season } from "@/types";
import { deriveStock, type ProductVariant } from "@/lib/shop/inventory";

type Gender = "دخترانه" | "پسرانه" | "یونیسکس";

// 🛍️ id is a small public numeric id (not Mongo's _id) — matches the numeric ids used everywhere else.
export type ProductDoc = {
  id: number;
  images: string[];
  name: string;
  cat: string;
  // 🆕 Additive, not a replacement for cat — cat still mixes category/gender today.
  gender?: Gender;
  ageRange?: string;
  // 🔗 Auto-generated from name on create, editable after.
  slug?: string;
  season?: Season;
  price: number;
  old?: number;
  disc?: string;
  badge?: string;
  rate: number;
  // 🧮 Derived from variants when any exist; stored (not computed) so unvaried products keep working untouched.
  stock: boolean;
  // 🆕 Per size(/color) stock; empty for legacy/unsized products, which keep using the stock boolean above.
  variants: ProductVariant[];
  sold: number;
  desc: string;
  seoTitle?: string;
  seoDescription?: string;
  visible: boolean;
  featured: boolean;
  // 🧵 Admin-curated "complete the look" pairing — a list of other product ids.
  pairsWith?: number[];
  updatedAt: Date;
};

const productVariantSchema = new Schema<ProductVariant>(
  {
    size: { type: String, required: true },
    color: String,
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false },
);

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
    gender: { type: String, enum: ["دخترانه", "پسرانه", "یونیسکس"] },
    ageRange: String,
    slug: { type: String, unique: true, sparse: true },
    season: String,
    price: { type: Number, required: true },
    old: Number,
    disc: String,
    badge: String,
    rate: { type: Number, default: 4.8 },
    stock: { type: Boolean, default: true },
    variants: { type: [productVariantSchema], default: [] },
    pairsWith: { type: [Number], default: [] },
    sold: { type: Number, default: 0 },
    desc: { type: String, required: true },
    seoTitle: String,
    seoDescription: String,
    visible: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// 🔁 Keeps stock honest with variants on .save()/create; findOneAndUpdate paths recompute it themselves.
productSchema.pre("save", function () {
  this.stock = deriveStock(this.variants, this.stock);
});

export const ProductModel: Model<ProductDoc> =
  (models.Product as Model<ProductDoc>) ||
  model<ProductDoc>("Product", productSchema);

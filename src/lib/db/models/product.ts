import "server-only";
import { Schema, model, models, type Model } from "mongoose";
import type { Season } from "@/types";
import { deriveStock, type ProductVariant } from "@/lib/shop/inventory";

export type { ProductVariant };

export type Gender = "دخترانه" | "پسرانه" | "یونیسکس";

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
  // 🆕 Additive, not a replacement for `cat` — `cat` still mixes
  // category/gender today (see `CATS` in `@/lib/constants`); splitting that
  // apart would ripple through the storefront's category filter/URLs for no
  // operational win. `gender` is a separate, optional refinement instead.
  gender?: Gender;
  ageRange?: string;
  // 🔗 Auto-generated from `name` on create, editable after — same
  // uniqueness pattern as `ArticleModel.slug`.
  slug?: string;
  season?: Season;
  price: number;
  old?: number;
  disc?: string;
  badge?: string;
  rate: number;
  // 🧮 Derived from `variants` when any exist (see `deriveStock` in
  // `@/lib/shop/inventory`) — kept as a real stored boolean, not computed at
  // read time, so every existing consumer (shop filters, PDP badge, product
  // card) keeps working untouched for products that never get variants.
  stock: boolean;
  // 🆕 Per size(/color) stock — the actual fix for "a boolean can't tell you
  // which size is out". Empty for legacy/unsized products (accessories,
  // catalog rows created before this existed): they keep using the plain
  // `stock` boolean above.
  variants: ProductVariant[];
  sold: number;
  desc: string;
  seoTitle?: string;
  seoDescription?: string;
  visible: boolean;
  featured: boolean;
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
    sold: { type: Number, default: 0 },
    desc: { type: String, required: true },
    seoTitle: String,
    seoDescription: String,
    visible: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// 🔁 Keeps the stored `stock` boolean honest with `variants` on every save
// path that goes through the Mongoose document (`.save()`, `Model.create`) —
// the admin actions that use `findOneAndUpdate` instead recompute it
// themselves before writing (see `admin/products/_lib/actions.ts`), since
// `pre("findOneAndUpdate")` can't see the merged result cheaply.
productSchema.pre("save", function () {
  this.stock = deriveStock(this.variants, this.stock);
});

export const ProductModel: Model<ProductDoc> =
  (models.Product as Model<ProductDoc>) ||
  model<ProductDoc>("Product", productSchema);

import "server-only";
import { Schema, model, models, type Model } from "mongoose";

// 📰 slug is the natural unique key — already the URL, no separate id needed.
export type ArticleDoc = {
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  body: string;
  cover?: string;
  published: boolean;
  // 🏷️ Multi-value taxonomy, distinct from the single fixed `tag` category above; not a Mongoose ref.
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

const articleSchema = new Schema<ArticleDoc>(
  {
    slug: { type: String, required: true, unique: true },
    tag: { type: String, required: true },
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    body: { type: String, required: true },
    cover: String,
    published: { type: Boolean, default: true },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const ArticleModel: Model<ArticleDoc> =
  (models.Article as Model<ArticleDoc>) ||
  model<ArticleDoc>("Article", articleSchema);

import "server-only";
import { Schema, model, models, type Model } from "mongoose";

// 📰 The magazine. `slug` is the natural unique key — already the URL
// (`/articles/[slug]`), so no separate id is needed.
export type ArticleDoc = {
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  body: string;
  cover?: string;
  published: boolean;
  createdAt: Date;
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
  },
  { timestamps: true },
);

export const ArticleModel: Model<ArticleDoc> =
  (models.Article as Model<ArticleDoc>) ||
  model<ArticleDoc>("Article", articleSchema);

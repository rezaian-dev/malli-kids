import "server-only";
import { Schema, model, models, type Model } from "mongoose";

// 🏷️ Canonical content taxonomy for articles — a real entity (not a
// free-text CSV string on the article row) so the same tag is one row
// reused everywhere it applies, renaming it once updates every article, and
// two admins can't accidentally create "تابستان" and "تابستانی" as if
// they're different tags without at least colliding on the same slug.
export type TagDoc = {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
};

const tagSchema = new Schema<TagDoc>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export const TagModel: Model<TagDoc> =
  (models.Tag as Model<TagDoc>) || model<TagDoc>("Tag", tagSchema);

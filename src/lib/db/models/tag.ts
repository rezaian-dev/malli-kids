import "server-only";
import { Schema, model, models, type Model } from "mongoose";

// 🏷️ A real entity, not a free-text string — renaming a tag updates every article that uses it.
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

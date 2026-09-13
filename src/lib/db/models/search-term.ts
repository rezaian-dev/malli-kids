import "server-only";
import { Schema, model, models, type Model } from "mongoose";

export type SearchTermDoc = {
  term: string;
  count: number;
  updatedAt: Date;
};

const searchTermSchema = new Schema<SearchTermDoc>(
  {
    term: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: false, updatedAt: true } },
);

// The only read pattern this collection ever serves: "top N by count".
searchTermSchema.index({ count: -1 });

export const SearchTermModel: Model<SearchTermDoc> =
  (models.SearchTerm as Model<SearchTermDoc>) ||
  model<SearchTermDoc>("SearchTerm", searchTermSchema);

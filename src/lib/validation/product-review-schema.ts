import { z } from "zod";
import { longText, optText } from "@/lib/forms";

const rating = z
  .string({ error: () => "اول از همه، چند ستاره می‌دهید؟" })
  .refine((v) => /^[1-5]$/.test(v), "اول از همه، چند ستاره می‌دهید؟");

export const reviewSchema = z.object({
  rating,
  title: optText(60, "عنوانِ نظر"),
  body: longText("نظر", 20, 500),
});

export type ReviewValues = z.infer<typeof reviewSchema>;
export const reviewDefaults: ReviewValues = { rating: "", title: "", body: "" };
export const RATING_STARS = ["1", "2", "3", "4", "5"] as const;

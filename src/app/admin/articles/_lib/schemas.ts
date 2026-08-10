import { z } from "zod";

export const articleSchema = z.object({
  title: z.string().trim().min(3).max(120),
  tag: z.string().trim().min(1).max(30),
  excerpt: z.string().trim().min(1).max(300),
  body: z.string().trim().min(1),
  cover: z.string().trim().optional(),
  published: z.boolean(),
  // 🏷️ `Tag.slug` references — capped well below keyword-stuffing territory
  // (this is a content taxonomy, not an SEO keyword bag; see `@/lib/tags`).
  tags: z.array(z.string().trim().min(1)).max(8).default([]),
});

export const tagNameSchema = z.string().trim().min(2).max(30);

export type ArticleValues = z.infer<typeof articleSchema>;

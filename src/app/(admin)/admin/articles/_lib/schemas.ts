import { z } from "zod";

export const articleSchema = z.object({
  title: z.string().trim().min(3).max(120),
  tag: z.string().trim().min(1).max(30),
  excerpt: z.string().trim().min(1).max(300),
  body: z.string().trim().min(1),
  cover: z.string().trim().optional(),
  published: z.boolean(),
});

export type ArticleValues = z.infer<typeof articleSchema>;

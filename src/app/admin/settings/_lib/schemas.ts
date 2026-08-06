import { z } from "zod";

export const settingsSchema = z.object({
  active: z.boolean(),
  percent: z.number().int().min(1).max(90),
  title: z.string().trim().min(2).max(60),
  supportStart: z.number().int().min(0).max(23),
  supportEnd: z.number().int().min(0).max(23),
  supportLabel: z.string().trim().min(2).max(80),
});

export type SettingsValues = z.infer<typeof settingsSchema>;

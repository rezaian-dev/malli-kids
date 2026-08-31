import { z } from "zod";

/** جستجویِ خانهِ سایت — عبارتِ خالی مجاز (رفتن به کلِ فروشگاه)، ولی یک حرف نه */
export const searchSchema = z.object({
  q: z
    .string()
    .trim()
    .max(60, "عبارتِ جستجو حداکثر ۶۰ حرف می‌تواند باشد")
    .refine((v) => v === "" || v.length >= 2, "برای جستجو حداقل ۲ حرف بنویسید"),
});

export type SearchValues = z.infer<typeof searchSchema>;
export const searchDefaults: SearchValues = { q: "" };

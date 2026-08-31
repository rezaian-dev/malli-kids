import { z } from "zod";

export const MIN_QUERY = 2;

/** فیلدِ «جستجو» در پنلِ فیلترها — خالی یعنی «بدونِ فیلتر» */
export const shopFiltersSchema = z.object({
  q: z
    .string()
    .trim()
    .max(60, "عبارتِ جستجو حداکثر ۶۰ حرف می‌تواند باشد")
    .refine((v) => v === "" || v.length >= MIN_QUERY, `برای جستجو حداقل ${MIN_QUERY === 2 ? "۲" : MIN_QUERY} حرف بنویسید`),
});

export type ShopFiltersValues = z.infer<typeof shopFiltersSchema>;
export const shopFiltersDefaults: ShopFiltersValues = { q: "" };

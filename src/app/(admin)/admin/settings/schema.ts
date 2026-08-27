import { z } from "zod";
import { amount, telOrMobile, text } from "@/lib/forms";

/** تنظیماتِ فروشگاه — مبالغ به تومان و رشتهٔ عددی (تا ارقامِ فارسی هم پذیرفته شود) */
export const settingsSchema = z.object({
  freeShipFrom: amount("آستانه ارسال رایگان", { min: 0, max: 50_000_000 }),
  phoneFa: telOrMobile("تلفن گالری"),
  address: text("آدرس", 8, 160),
});

export type SettingsValues = z.infer<typeof settingsSchema>;

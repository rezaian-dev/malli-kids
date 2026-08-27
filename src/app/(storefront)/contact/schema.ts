import { z } from "zod";
import { longText, optMobile, text } from "@/lib/forms";

/** فرم «پیام بگذارید» در صفحهٔ تماس */
export const contactSchema = z.object({
  name: text("نام", 2, 60),
  phone: optMobile(),
  msg: longText("پیام", 10, 600),
});

export type ContactValues = z.infer<typeof contactSchema>;

export const contactDefaults: ContactValues = { name: "", phone: "", msg: "" };

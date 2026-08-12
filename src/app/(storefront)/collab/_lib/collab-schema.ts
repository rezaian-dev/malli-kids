import { z } from "zod";
import { mobile, text, longText } from "@/lib/forms";

export const collabSchema = z.object({
  name: text("نام", 2, 60),
  phone: mobile("شمارهٔ موبایل"),
  kind: z.string().min(1, "نوع همکاری را انتخاب کنید"),
  text: longText("توضیح", 10, 600),
});

export type CollabValues = z.infer<typeof collabSchema>;

export const collabDefaults: CollabValues = {
  name: "",
  phone: "",
  kind: "",
  text: "",
};

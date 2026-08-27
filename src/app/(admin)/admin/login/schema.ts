import { password, text } from "@/lib/forms";
import { z } from "zod";

/** ورودِ تیمِ گالری — شناسه و رمزِ حداقل ۶ نویسه */
export const adminLoginSchema = z.object({
  user: text("شناسه", 3, 40),
  pass: password(6),
});

export type AdminLoginValues = z.infer<typeof adminLoginSchema>;
export const adminLoginDefaults: AdminLoginValues = { user: "", pass: "" };

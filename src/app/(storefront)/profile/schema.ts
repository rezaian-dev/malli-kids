import { z } from "zod";
import { email, nationalId, optMobile, optText, text } from "@/lib/forms";

/** ویرایشِ حساب — نام و ایمیل الزامی، بقیه اختیاری ولی با قاعدهٔ واقعی */
export const accountSchema = z
  .object({
    firstName: text("نام", 2, 40),
    lastName: optText(40, "نام خانوادگی"),
    nationalId: nationalId(),
    city: optText(40, "شهر"),
    address: optText(160, "آدرس"),
    phone: optMobile(),
    email: email("ایمیل"),
  })
  .superRefine((v, ctx) => {
    // قاعدهٔ دو فیلدی: آدرسِ بی‌شهر، قابلِ ارسال نیست
    if (v.address.trim() && !v.city.trim()) {
      ctx.addIssue({ code: "custom", path: ["city"], message: "با آدرس، شهر را هم بنویسید" });
    }
  });

export type AccountValues = z.infer<typeof accountSchema>;
export const accountDefaults: AccountValues = {
  firstName: "",
  lastName: "",
  nationalId: "",
  city: "",
  address: "",
  phone: "",
  email: "",
};

/** اطلاعاتِ کوچولو — همه اختیاری، ولی اگر نوشته شد باید درست باشد */
export const childSchema = z.object({
  childName: optText(40, "نام کوچولو"),
  childAge: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || /^[0-9۰-۹]{1,2}(\s*(?:سال|ساله|ماه))?$/.test(v),
      "سن را ساده بنویسید، مثل «۳ سال»",
    ),
  childGender: z
    .string()
    .trim()
    .refine((v) => v === "" || v === "دختر" || v === "پسر", "یا «دختر» را انتخاب کنید یا «پسر»"),
});

export type ChildValues = z.infer<typeof childSchema>;
export const childDefaults: ChildValues = { childName: "", childAge: "", childGender: "" };

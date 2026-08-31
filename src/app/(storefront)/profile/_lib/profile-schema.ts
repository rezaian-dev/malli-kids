import { z } from "zod";
import {
  email,
  longText,
  nationalId,
  optMobile,
  optText,
  text,
} from "@/lib/forms";

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
    if (v.address.trim() && !v.city.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["city"],
        message: "با آدرس، شهر را هم بنویسید",
      });
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
    .refine(
      (v) => v === "" || v === "دختر" || v === "پسر",
      "یا «دختر» را انتخاب کنید یا «پسر»",
    ),
});

export type ChildValues = z.infer<typeof childSchema>;
export const childDefaults: ChildValues = {
  childName: "",
  childAge: "",
  childGender: "",
};

export const ticketSchema = z.object({
  subject: text("موضوع", 3, 60),
  message: longText("پیام", 10, 600),
});

export type TicketValues = z.infer<typeof ticketSchema>;
export const ticketDefaults: TicketValues = { subject: "", message: "" };

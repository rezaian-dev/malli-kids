import { z } from "zod";
import { fullName, nationalId, optMobile, optText } from "@/lib/forms";

export const updateAccountSchema = z.object({
  name: fullName(),
  phone: optMobile(),
  nationalId: nationalId(),
  city: optText(40, "شهر"),
  address: optText(160, "آدرس"),
});
export type UpdateAccountValues = z.infer<typeof updateAccountSchema>;
export const updateAccountDefaults: UpdateAccountValues = {
  name: "",
  phone: "",
  nationalId: "",
  city: "",
  address: "",
};

export const updateChildSchema = z.object({
  childName: optText(40, "نام کوچولو"),
  childAge: optText(20, "سن"),
  childGender: z.enum(["دختر", "پسر"]).optional(),
});
export type UpdateChildValues = z.infer<typeof updateChildSchema>;
export const updateChildDefaults: UpdateChildValues = {
  childName: "",
  childAge: "",
  childGender: undefined,
};

// 🖼️ Upload cap: reject the raw file before it's even compressed.
export const AVATAR_MAX_BYTES = 1024 * 1024; // 1MB

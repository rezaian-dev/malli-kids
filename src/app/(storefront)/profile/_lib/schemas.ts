import { z } from "zod";
import { fullName, nationalId, optMobile, optText } from "@/lib/forms";

// 📍 Set together by the map picker; either both present or both absent —
// never trusted as-is server-side (`reverseGeocodeAction`/`updateAccountAction`
// re-validate the range regardless of what the client sends).
const latitude = z.number().min(-90).max(90).optional();
const longitude = z.number().min(-180).max(180).optional();

export const updateAccountSchema = z.object({
  name: fullName(),
  phone: optMobile(),
  nationalId: nationalId(),
  city: optText(40, "شهر"),
  address: optText(160, "آدرس"),
  lat: latitude,
  lng: longitude,
});
export type UpdateAccountValues = z.infer<typeof updateAccountSchema>;
export const updateAccountDefaults: UpdateAccountValues = {
  name: "",
  phone: "",
  nationalId: "",
  city: "",
  address: "",
  lat: undefined,
  lng: undefined,
};

export const reverseGeocodeSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type ReverseGeocodeValues = z.infer<typeof reverseGeocodeSchema>;

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

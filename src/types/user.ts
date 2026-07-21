// 👤 Authenticated customer profile (account area, checkout prefill).

export type User = {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  avatar?: string;
  postalCode?: string;
  city?: string;
  address?: string;
  lat?: number;
  lng?: number;
  childName?: string;
  childAge?: string;
  childGender?: string;
  // 📏 Height in cm, kept as free text like `childAge` — parsed with
  // `parseFaNumber` wherever it feeds `sizeForHeightCm` (PDP size
  // recommendation, try-on studio default).
  childHeightCm?: string;
};

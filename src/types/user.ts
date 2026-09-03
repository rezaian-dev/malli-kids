// 👤 Authenticated customer profile (account area, checkout prefill).

export type User = {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  avatar?: string;
  nationalId?: string;
  city?: string;
  address?: string;
  lat?: number;
  lng?: number;
  childName?: string;
  childAge?: string;
  childGender?: string;
};

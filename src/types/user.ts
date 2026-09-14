// Authenticated customer profile (account area, checkout prefill).

export type User = {
  id?: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  /** Verified identity number used for OTP login/password recovery, not a delivery contact. */
  recoveryPhone?: string;
  avatar?: string;
  postalCode?: string;
  city?: string;
  address?: string;
  lat?: number;
  lng?: number;
  childName?: string;
  childAge?: string;
  childGender?: string;
  // Free text like childAge — parsed via parseFaNumber where needed
  childHeightCm?: string;
};

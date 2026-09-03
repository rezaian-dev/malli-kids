import { ClickProgress } from "./click-progress";
import { BackToTop } from "./back-to-top";
import { AuthModalMount } from "@/components/auth/auth-modal-mount";

// ✨ Keep storefront helpers ready without visual fallback swaps. 🪶
export function StorefrontEnhancements() {
  return (
    <>
      <ClickProgress />
      <BackToTop />
      <AuthModalMount />
    </>
  );
}

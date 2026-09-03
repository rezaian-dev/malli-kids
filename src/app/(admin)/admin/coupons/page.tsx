import { requireAdminPage } from "@/lib/auth/admin";
import { getAllCoupons } from "./_lib/data";
import { AdminCouponsLanding } from "./_components/admin-coupons-landing";

export default async function AdminCoupons() {
  const admin = await requireAdminPage();

  const coupons = await getAllCoupons();

  return <AdminCouponsLanding coupons={coupons} />;
}

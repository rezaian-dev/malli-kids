import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminCouponsLanding } from "./_components/admin-coupons-landing";

export default async function AdminCoupons() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  return <AdminCouponsLanding />;
}

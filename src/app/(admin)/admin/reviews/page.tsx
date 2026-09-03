import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminReviewsLanding } from "./_components/admin-reviews-landing";

export default async function AdminReviews() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  return <AdminReviewsLanding />;
}

import { requireAdminPage } from "@/lib/auth/admin";
import { getAllReviews } from "./_lib/data";
import { AdminReviewsLanding } from "./_components/admin-reviews-landing";

export default async function AdminReviews() {
  const admin = await requireAdminPage();

  const reviews = await getAllReviews();

  return <AdminReviewsLanding reviews={reviews} />;
}

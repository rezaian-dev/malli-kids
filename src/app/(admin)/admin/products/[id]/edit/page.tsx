import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { EditProductLanding } from "./_components/edit-product-landing";

export default async function EditProductPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  return <EditProductLanding />;
}

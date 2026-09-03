import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  return <ProductForm />;
}

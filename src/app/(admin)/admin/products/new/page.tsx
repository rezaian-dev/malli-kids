import { requireAdminPage } from "@/lib/auth/admin";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const admin = await requireAdminPage();

  return <ProductForm />;
}
